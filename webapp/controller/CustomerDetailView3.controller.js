sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("project3.controller.CustomerDetailView3", {

        onInit: function () {
            // Get the router and listen for route matches
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("customerDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        // When route matches (user navigates to this page)
        _onRouteMatched: function (oEvent) {
            var sCustomerID = oEvent.getParameter("arguments").CustomerID;
            this._bindView(sCustomerID);
        },

        // Bind the view to the selected customer data
        _bindView: function (sCustomerID) {
            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/Customers('" + sCustomerID + "')";

            this.getView().bindElement({
                path: sPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        // Could show loading indicator here
                    },
                    dataReceived: function () {
                        // Could hide loading indicator here
                    }
                }
            });
        },

        // When data binding changes
        _onBindingChange: function () {
            var oElementBinding = this.getView().getElementBinding();
            if (!oElementBinding.getBoundContext()) {
                MessageBox.error("Customer not found");
                this.onNavBack();
            }
        },

        // When user clicks Save button
        onSave: function () {
            var oModel = this.getOwnerComponent().getModel();

            // Check if there are any changes to save
            if (oModel.hasPendingChanges()) {
                // Submit all changes
                oModel.submitChanges({
                    success: function () {
                        MessageToast.show("Details saved successfully");
                    },
                    error: function () {
                        MessageBox.error("Error saving customer details");
                    }
                });
            } else {
                MessageToast.show("No changes to save");
            }
        },

        // When user clicks Cancel button
        onCancel: function () {
            var oModel = this.getOwnerComponent().getModel();

            // Check if there are unsaved changes
            if (oModel.hasPendingChanges()) {
                MessageBox.confirm("Are you sure you want to discard your changes?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            // Reset changes and go back
                            oModel.resetChanges();
                            this.onNavBack();
                        }
                    }.bind(this)
                });
            } else {
                this.onNavBack();
            }
        },

        // Navigate back to customer list
        onNavBack: function () {
            var oHistory = sap.ui.core.routing.History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("customerList");
            }
        }
    });
});