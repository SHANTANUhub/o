sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("project3.controller.DashboardView1", {
        onInit() {
            // Create simple model for dashboard data
            const oModel = new JSONModel({
                dashboard: {
                    TotalOrders: 0,
                    TotalCustomers: 0,
                    PendingDeliveries: 0,
                    CustomerSatisfaction: 89,
                    TotalProducts: 0,
                    Clock: new Date().toLocaleTimeString()
                }
            });
            this.getView().setModel(oModel, "dashboard");

            // Load data from OData service
            this._loadData();

            // Update clock every second
            setInterval(() => {
                oModel.setProperty("/dashboard/Clock", new Date().toLocaleTimeString());
            }, 1000);
        },

        _loadData() {
            const oDataModel = this.getOwnerComponent().getModel();
            const oLocalModel = this.getView().getModel("dashboard");

            // Load total orders
            oDataModel.read("/Orders", {
                urlParameters: { "$inlinecount": "allpages", "$top": "1" },
                success: (data) => {
                    oLocalModel.setProperty("/dashboard/TotalOrders", data.__count || 0);
                }
            });

            // Load total products
            oDataModel.read("/Products", {
                urlParameters: { "$inlinecount": "allpages", "$top": "1" },
                success: (data) => {
                    oLocalModel.setProperty("/dashboard/TotalProducts", data.__count || 0);
                }
            });

            // Load pending orders (not shipped yet)
            oDataModel.read("/Orders", {
                urlParameters: {
                    "$filter": "ShippedDate eq null",
                    "$inlinecount": "allpages",
                    "$top": 1
                },
                success: (data) => {
                    oLocalModel.setProperty("/dashboard/PendingDeliveries", (data.__count) || 0);
                }
            });

            // Load total customers
            oDataModel.read("/Customers", {
                urlParameters: { "$inlinecount": "allpages", "$top": "1" },
                success: (data) => {
                    oLocalModel.setProperty("/dashboard/TotalCustomers", data.__count || 0);
                }
            });
        },

        formatDate() {
            const today = new Date();
            return today.toLocaleDateString();
        },

        onNavigateToCustomers() {
            this.getOwnerComponent().getRouter().navTo("customerList");
        },

        onNavigateToProducts() {
            this.getOwnerComponent().getRouter().navTo("productList");
        },

        onNavigateToOrders() {
            this.getOwnerComponent().getRouter().navTo("orderList");
        },
        onNavigateToReports(){
             this.getOwnerComponent().getRouter().navTo("reports");
        },
        onNavigateToSettings(){
            this.getOwnerComponent().getRouter().navTo("settings");
        },
        onNavigateToSuppliers(){
            this.getOwnerComponent().getRouter().navTo("supplier");
        }
    });
});