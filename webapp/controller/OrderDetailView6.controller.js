sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project3.controller.OrderDetailView6", {
        onInit() {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("orderDetail").attachPatternMatched(this._onOrderMatched, this);
        },

        _onOrderMatched(oEvent) {
            const sOrderID = oEvent.getParameter("arguments").OrderID;
            this._bindView("/Orders(" + sOrderID + ")");
        },

        _bindView(sOrderPath) {
            const oView = this.getView();

            oView.bindElement({
                path: sOrderPath,
                parameters: {
                    expand: "Customer,Employee,Shipper,Order_Details/Product/Category,Order_Details/Product/Supplier"
                },
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oView.setBusy(true);
                    },
                    dataReceived: function () {
                        oView.setBusy(false);
                    }
                }
            });
        },

        _onBindingChange() {
            const oView = this.getView();
            const oElementBinding = oView.getElementBinding();

            if (!oElementBinding.getBoundContext()) {
                this.oRouter.getTargets().display("notFound");
            }
        },

        onNavBack() {
            this.oRouter.navTo("orderList");
        },

        formatOrderStatus(sShippedDate) {
            if (sShippedDate) {
                return "Shipped";
            }
            return "Pending";
        },

        formatOrderStatusState(sShippedDate) {
            if (sShippedDate) {
                return "Success";
            }
            return "Warning";
        },

        formatDiscount(fDiscount) {
            if (fDiscount > 0) {
                return (fDiscount * 100).toFixed(0) + "%";
            }
            return "No Discount";
        },

        calculateLineTotal(fUnitPrice, iQuantity, fDiscount) {
            if (fUnitPrice && iQuantity) {
                const fTotal = fUnitPrice * iQuantity * (1 - fDiscount);
                return fTotal.toFixed(2);
            }
            return "0.00";
        },

        calculateOrderTotal(aOrderDetails) {
            if (!aOrderDetails || aOrderDetails.length === 0) {
                return "0.00";
            }

            let fTotal = 0;
            aOrderDetails.forEach(function (oItem) {
                const fLineTotal = oItem.UnitPrice * oItem.Quantity * (1 - oItem.Discount);
                fTotal += fLineTotal;
            });

            return fTotal.toFixed(2);
        }
    });
});
