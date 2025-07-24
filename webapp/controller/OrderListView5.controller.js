sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("project3.controller.OrderListView5", {
        onInit() {
            this.oRouter = this.getOwnerComponent().getRouter();

            // Initialize filter model
            this._initializeFilterModel();

            // Initialize new order model
            this._initializeNewOrderModel();
        },

        _initializeFilterModel() {
            const oFilterModel = new JSONModel({
                dateFrom: null,
                dateTo: null,
                customer: "",
                employee: "",
                shipper: ""
            });
            this.getView().setModel(oFilterModel, "filter");
        },

        _initializeNewOrderModel() {
            const oNewOrderModel = new JSONModel({
                CustomerID: "",
                EmployeeID: "",
                OrderDate: new Date(),
                RequiredDate: null,
                ShipVia: "",
                Freight: 0,
                ShipName: "",
                ShipAddress: "",
                ShipCity: "",
                ShipRegion: "",
                ShipPostalCode: "",
                ShipCountry: ""
            });
            this.getView().setModel(oNewOrderModel, "newOrder");
        },

        onApplyFilters() {
            const oTable = this.byId("ordersTable");
            const oBinding = oTable.getBinding("items");
            const oFilterModel = this.getView().getModel("filter");
            const oFilterData = oFilterModel.getData();

            const aFilters = [];

            // Date range filter
            if (oFilterData.dateFrom) {
                aFilters.push(new Filter("OrderDate", FilterOperator.GE, oFilterData.dateFrom));
            }
            if (oFilterData.dateTo) {
                aFilters.push(new Filter("OrderDate", FilterOperator.LE, oFilterData.dateTo));
            }

            // Customer filter
            if (oFilterData.customer) {
                aFilters.push(new Filter("CustomerID", FilterOperator.EQ, oFilterData.customer));
            }

            // Employee filter
            if (oFilterData.employee) {
                aFilters.push(new Filter("EmployeeID", FilterOperator.EQ, oFilterData.employee));
            }

            // Shipper filter
            if (oFilterData.shipper) {
                aFilters.push(new Filter("ShipVia", FilterOperator.EQ, oFilterData.shipper));
            }

            oBinding.filter(aFilters);
            MessageToast.show("Filters applied");
        },

        onClearFilters() {
            // Clear filter model
            this._initializeFilterModel();

            // Clear table filters
            const oTable = this.byId("ordersTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter([]);

            // Clear search field
            this.byId("searchField").setValue("");

            MessageToast.show("Filters cleared");
        },

        onSearch(oEvent) {
            const sQuery = oEvent.getParameter("newValue");
            const oTable = this.byId("ordersTable");
            const oBinding = oTable.getBinding("items");

            if (sQuery && sQuery.length > 0) {
                const aFilters = [
                    new Filter([
                        new Filter("OrderID", FilterOperator.Contains, sQuery),
                        new Filter("Customer/CompanyName", FilterOperator.Contains, sQuery),
                        new Filter("Employee/FirstName", FilterOperator.Contains, sQuery),
                        new Filter("Employee/LastName", FilterOperator.Contains, sQuery),
                        new Filter("Shipper/CompanyName", FilterOperator.Contains, sQuery)
                    ], false)
                ];
                oBinding.filter(aFilters);
            } else {
                oBinding.filter([]);
            }
        },

        onRefresh() {
            const oModel = this.getView().getModel();
            oModel.refresh();
            MessageToast.show("Data refreshed");
        },

        onOrderPress(oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const sOrderID = oContext.getProperty("OrderID");

            this.oRouter.navTo("orderDetail", {
                OrderID: sOrderID
            });
        },

        onCreateOrder() {
            if (!this._oCreateOrderDialog) {
                this._oCreateOrderDialog = sap.ui.xmlfragment(
                    "project3.fragments.CreateOrderDialog",
                    this
                );
                this.getView().addDependent(this._oCreateOrderDialog);
            }

            // Reset the new order model
            this._initializeNewOrderModel();

            this._oCreateOrderDialog.open();
        },

        onSaveNewOrder() {
            const oModel = this.getView().getModel();
            const oNewOrderModel = this.getView().getModel("newOrder");
            const oNewOrderData = oNewOrderModel.getData();

            // Validate required fields
            if (!oNewOrderData.CustomerID) {
                MessageBox.error("Please select a customer");
                return;
            }

            if (!oNewOrderData.EmployeeID) {
                MessageBox.error("Please select an employee");
                return;
            }

            if (!oNewOrderData.OrderDate) {
                MessageBox.error("Please select an order date");
                return;
            }

            // Create new order entry
            const oNewOrder = {
                CustomerID: oNewOrderData.CustomerID,
                EmployeeID: parseInt(oNewOrderData.EmployeeID),
                OrderDate: oNewOrderData.OrderDate,
                RequiredDate: oNewOrderData.RequiredDate,
                ShipVia: oNewOrderData.ShipVia ? parseInt(oNewOrderData.ShipVia) : null,
                Freight: parseFloat(oNewOrderData.Freight) || 0,
                ShipName: oNewOrderData.ShipName,
                ShipAddress: oNewOrderData.ShipAddress,
                ShipCity: oNewOrderData.ShipCity,
                ShipRegion: oNewOrderData.ShipRegion,
                ShipPostalCode: oNewOrderData.ShipPostalCode,
                ShipCountry: oNewOrderData.ShipCountry
            };

            // Create the order
            oModel.create("/Orders", oNewOrder, {
                success: () => {
                    MessageToast.show("Order created successfully");
                    this._oCreateOrderDialog.close();
                    this.onRefresh();
                },
                error: (oError) => {
                    MessageBox.error("Failed to create order: " + oError.message);
                }
            });
        },

        onCancelCreateOrder() {
            this._oCreateOrderDialog.close();
        },

        formatFreight(fFreight) {
            if (fFreight === null || fFreight === undefined || fFreight === "") {
                return "$0.00";
            }
            return "$" + parseFloat(fFreight).toFixed(2);
        },

        formatShippedDate(dShippedDate) {
            if (!dShippedDate) {
                return "Not Shipped";
            }
            const oDate = new Date(dShippedDate);
            return oDate.toLocaleDateString('en-GB'); // dd/mm/yyyy format
        }
    });
});
