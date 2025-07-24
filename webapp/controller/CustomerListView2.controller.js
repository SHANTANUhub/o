sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("project3.controller.CustomerListView2", {

        onInit: function () {
        },

        // When user types in search field
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            this._applyFilters(sQuery);
        },

        // When user selects a country filter
        onCountryFilterChange: function (oEvent) {
            var sCountry = oEvent.getParameter("selectedItem").getKey();
            this._applyFilters(null, sCountry);
        },

        // When user selects a city filter  
        onCityFilterChange: function (oEvent) {
            var sCity = oEvent.getParameter("selectedItem").getKey();
            this._applyFilters(null, null, sCity);
        },

        // Apply search and filters to the table
        _applyFilters: function (sSearchQuery, sCountry, sCity) {
            var oTable = this.byId("customerTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            // Get current values if not provided
            sSearchQuery = sSearchQuery || this.byId("searchField").getValue();
            sCountry = sCountry || this.byId("countryFilter").getSelectedKey();
            sCity = sCity || this.byId("cityFilter").getSelectedKey();

            // Add search filter if user typed something
            if (sSearchQuery) {
                var oSearchFilter = new Filter([
                    new Filter("CustomerID", FilterOperator.Contains, sSearchQuery),
                    new Filter("CompanyName", FilterOperator.Contains, sSearchQuery),
                    new Filter("ContactName", FilterOperator.Contains, sSearchQuery)
                ], false); // false means OR condition
                aFilters.push(oSearchFilter);
            }

            // Add country filter if selected
            if (sCountry) {
                aFilters.push(new Filter("Country", FilterOperator.EQ, sCountry));
            }

            // Add city filter if selected
            if (sCity) {
                aFilters.push(new Filter("City", FilterOperator.EQ, sCity));
            }

            // Apply all filters to the table
            oBinding.filter(aFilters);
        },

        // When user clicks on a customer row
        onCustomerPress: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            var sCustomerID = oBindingContext.getProperty("CustomerID");

            // Navigate to customer detail page
            this.getOwnerComponent().getRouter().navTo("customerDetail", {
                CustomerID: sCustomerID
            });
        },

        // When user clicks "Create New Customer" button
        onCreateCustomer: function () {
            // Open the dialog to create new customer
            if (!this.oCreateDialog) {
                this.oCreateDialog = sap.ui.xmlfragment(this.getView().getId(), "project3.fragments.createCustomerDialog", this);
                this.getView().addDependent(this.oCreateDialog);
            }
            this.oCreateDialog.open();
        },

        // When user clicks Save in the Create Customer dialog
        onSaveNewCustomer: function () {
            var oModel = this.getOwnerComponent().getModel();

            // Get input values from the dialog
            var sCustomerID = sap.ui.core.Fragment.byId(this.getView().getId(), "newCustomerID").getValue();
            var sCompanyName = sap.ui.core.Fragment.byId(this.getView().getId(), "newCompanyName").getValue();
            var sContactName = sap.ui.core.Fragment.byId(this.getView().getId(), "newContactName").getValue();
            var sCity = sap.ui.core.Fragment.byId(this.getView().getId(), "newCity").getValue();
            var sCountry = sap.ui.core.Fragment.byId(this.getView().getId(), "newCountry").getValue();
            var sPhone = sap.ui.core.Fragment.byId(this.getView().getId(), "newPhone").getValue();

            // Check if required fields are filled
            if (!sCustomerID || !sCompanyName) {
                MessageBox.error("Please fill Customer ID and Company Name");
                return;
            }

            // Create new customer object
            var oNewCustomer = {
                CustomerID: sCustomerID,
                CompanyName: sCompanyName,
                ContactName: sContactName,
                City: sCity,
                Country: sCountry,
                Phone: sPhone
            };

            // Save to database
            oModel.create("/Customers", oNewCustomer, {
                success: function () {
                    MessageToast.show("Customer created successfully!");
                    this.oCreateDialog.close();
                    this._clearDialog();
                }.bind(this),
                error: function () {
                    MessageBox.error("Error creating customer");
                }
            });
        },

        // When user clicks Cancel in the Create Customer dialog
        onCancelCreateCustomer: function () {
            this.oCreateDialog.close();
            this._clearDialog();
        },

        // Clear all fields in the dialog
        _clearDialog: function () {
            sap.ui.core.Fragment.byId(this.getView().getId(), "newCustomerID").setValue("");
            sap.ui.core.Fragment.byId(this.getView().getId(), "newCompanyName").setValue("");
            sap.ui.core.Fragment.byId(this.getView().getId(), "newContactName").setValue("");
            sap.ui.core.Fragment.byId(this.getView().getId(), "newCity").setValue("");
            sap.ui.core.Fragment.byId(this.getView().getId(), "newCountry").setValue("");
            sap.ui.core.Fragment.byId(this.getView().getId(), "newPhone").setValue("");
        }
    });
});
