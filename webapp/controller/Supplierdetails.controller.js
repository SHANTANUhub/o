sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("project3.controller.Supplierdetails", {
        onInit: function() {
            this.getOwnerComponent().getRouter().getRoute("detail").attachPatternMatched(this._onMatched, this);
        },

        _onMatched: function(oEvent) {
            const sSupplierID = oEvent.getParameter("arguments").SupplierID;
            this.getView().bindElement({
                path: "/Suppliers(" + sSupplierID + ")",
                parameters: {
                    expand: "Products"
                }
            });
        },

        onNavBack: function() {
            this.getOwnerComponent().getRouter().navTo("supplier");
        }
    });
});
