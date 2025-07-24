sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project3.controller.SupplierView7", {
        onInit() {
        },
         onSupplierPress: function(oEvent) {
            const sPath = oEvent.getSource().getBindingContext().getPath();
            const sSupplierID = sPath.split("(")[1].split(")")[0];
            this.getOwnerComponent().getRouter().navTo("detail", {
                SupplierID: sSupplierID
            });
        }, 
        onSupplierSelect: function (oEvent) {
    const oSelectedItem = oEvent.getParameter("listItem");
    const oContext = oSelectedItem.getBindingContext();
    const sSupplierId = oContext.getProperty("SupplierID");

    this.getOwnerComponent().getRouter().navTo("detail", {
        SupplierID: sSupplierId
    });
}

    });
    });
