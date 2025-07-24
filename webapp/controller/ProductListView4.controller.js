sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], (Controller, JSONModel, MessageToast, Fragment, Filter, FilterOperator, Sorter) => {
    "use strict";

    return Controller.extend("project3.controller.ProductListView4", {
        onInit() {
            // Initialize view model for UI states
            const oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                totalProducts: 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Initialize filter model
            const oFilterModel = new JSONModel({
                searchQuery: "",
                selectedCategory: "",
                minPrice: 0,
                maxPrice: 1000,
                lowStockOnly: false
            });
            this.getView().setModel(oFilterModel, "filter");
        },

        onProductPress: function (oEvent) {
            const oBindingContext = oEvent.getSource().getBindingContext();
            const oProductData = oBindingContext.getObject();

            this._showProductDetailDialog(oProductData);
        },

        _showProductDetailDialog: function (oProductData) {
            if (!this._oProductDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "project3.fragments.ProductDetailDialog",
                    controller: this
                }).then((oDialog) => {
                    this._oProductDialog = oDialog;
                    this.getView().addDependent(this._oProductDialog);
                    this._openProductDialog(oProductData);
                });
            } else {
                this._openProductDialog(oProductData);
            }
        },

        _openProductDialog: function (oProductData) {
            // Create a model with product data and additional info
            const oDialogModel = new JSONModel({
                ...oProductData,
                ProductImage: this._getProductImage(oProductData.ProductName),
                FormattedPrice: this._formatCurrency(oProductData.UnitPrice),
                StockStatus: this._getStockStatus(oProductData.UnitsInStock),
                StockStatusState: this._getStockStatusState(oProductData.UnitsInStock),
                DiscontinuedText: oProductData.Discontinued ? "Yes" : "No"
            });

            this._oProductDialog.setModel(oDialogModel, "product");
            this._oProductDialog.open();
        },

        onCloseProductDialog: function () {
            this._oProductDialog.close();
        },

        _getProductImage: function (sProductName) {
            // Map product names to sample images from internet
            const imageMap = {
                "Chai": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop",
                "Chang": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop",
                "Aniseed Syrup": "https://as2.ftcdn.net/v2/jpg/12/56/54/37/1000_F_1256543755_KtEjYIzRpzekhXDlw3XrSQGSC668QqvR.jpg",
                "Chef Anton's Cajun Seasoning": "https://as1.ftcdn.net/v2/jpg/15/78/24/82/1000_F_1578248267_wElEs8m1wOaKtgOYVytYnTtzn6ICAxV5.jpg",
                "Chef Anton's Gumbo Mix": "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=300&h=300&fit=crop",
                "Grandma's Boysenberry Spread": "https://as2.ftcdn.net/jpg/06/41/77/35/1024W_F_641773557_1S12GmkwWmdenf0fA9tO9mfKBiBw2ZZk_NW1.jpg",
                "Uncle Bob's Organic Dried Pears": "https://t3.ftcdn.net/jpg/02/83/64/80/240_F_283648075_VgQUFtJ2e0CD2eEDo9IkH97wo8NKjye4.jpg",
                "Northwoods Cranberry Sauce": "https://t3.ftcdn.net/jpg/02/50/41/50/240_F_250415076_a7yLePKm0E77twCvc71nubPZf5Q2dfQ3.jpg",
                "Mishi Kobe Niku": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=300&fit=crop ",
                "Ikura": "https://as1.ftcdn.net/v2/jpg/15/84/06/02/1000_F_1584060289_fLtPLM2rWPYFpMA7Yx3ZmRccxDMexKq4.jpg"
            };

            return imageMap[sProductName] || "https://t3.ftcdn.net/jpg/08/58/84/88/240_F_858848886_Tgp4NuCAwa2f4nWi9mb5wvjwMFD3Ubs5.jpg";
        },

        _formatCurrency: function (fPrice) {
            if (fPrice) {
                return "$" + parseFloat(fPrice).toFixed(2);
            }
            return "$0.00";
        },

        _getStockStatus: function (iStock) {
            if (iStock === 0) return "Out of Stock";
            if (iStock < 10) return "Low Stock";
            if (iStock < 50) return "In Stock";
            return "Well Stocked";
        },

        _getStockStatusState: function (iStock) {
            if (iStock === 0) return "Error";
            if (iStock < 10) return "Warning";
            return "Success";
        },

        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue");
            this._applyFilters(sQuery);
        },

        onFilterPress: function () {
            if (!this._oFilterDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "project3.fragments.ProductFilterDialog",
                    controller: this
                }).then((oDialog) => {
                    this._oFilterDialog = oDialog;
                    this.getView().addDependent(this._oFilterDialog);
                    this._oFilterDialog.open();
                });
            } else {
                this._oFilterDialog.open();
            }
        },

        onFilterDialogConfirm: function () {
            this._applyAdvancedFilters();
            this._oFilterDialog.close();
        },

        onFilterDialogCancel: function () {
            this._oFilterDialog.close();
        },

        _applyFilters: function (sQuery) {
            const oTable = this.byId("productsTable");
            const oBinding = oTable.getBinding("items");
            const aFilters = [];

            if (sQuery) {
                const oFilter = new Filter({
                    filters: [
                        new Filter("ProductName", FilterOperator.Contains, sQuery),
                        new Filter("Category/CategoryName", FilterOperator.Contains, sQuery),
                        new Filter("Supplier/CompanyName", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                aFilters.push(oFilter);
            }

            oBinding.filter(aFilters);
        },

        _applyAdvancedFilters: function () {
            const oFilterModel = this.getView().getModel("filter");
            const oFilterData = oFilterModel.getData();
            const oTable = this.byId("productsTable");
            const oBinding = oTable.getBinding("items");
            const aFilters = [];

            // Search query filter
            if (oFilterData.searchQuery) {
                const oSearchFilter = new Filter({
                    filters: [
                        new Filter("ProductName", FilterOperator.Contains, oFilterData.searchQuery),
                        new Filter("Category/CategoryName", FilterOperator.Contains, oFilterData.searchQuery)
                    ],
                    and: false
                });
                aFilters.push(oSearchFilter);
            }

            // Category filter
            if (oFilterData.selectedCategory) {
                aFilters.push(new Filter("Category/CategoryName", FilterOperator.EQ, oFilterData.selectedCategory));
            }

            // Price range filter
            if (oFilterData.minPrice > 0) {
                aFilters.push(new Filter("UnitPrice", FilterOperator.GE, oFilterData.minPrice));
            }
            if (oFilterData.maxPrice < 1000) {
                aFilters.push(new Filter("UnitPrice", FilterOperator.LE, oFilterData.maxPrice));
            }

            // Low stock filter
            if (oFilterData.lowStockOnly) {
                aFilters.push(new Filter("UnitsInStock", FilterOperator.LT, 10));
            }

            oBinding.filter(aFilters);
        },

        onSort: function (oEvent) {
            const oTable = this.byId("productsTable");
            const oBinding = oTable.getBinding("items");
            const sSelectedKey = oEvent.getParameter("selectedItem").getKey();

            let oSorter;
            switch (sSelectedKey) {
                case "name":
                    oSorter = new Sorter("ProductName", false);
                    break;
                case "nameDesc":
                    oSorter = new Sorter("ProductName", true);
                    break;
                case "price":
                    oSorter = new Sorter("UnitPrice", false);
                    break;
                case "priceDesc":
                    oSorter = new Sorter("UnitPrice", true);
                    break;
                case "stock":
                    oSorter = new Sorter("UnitsInStock", false);
                    break;
                case "stockDesc":
                    oSorter = new Sorter("UnitsInStock", true);
                    break;
                default:
                    oSorter = new Sorter("ProductName", false);
            }

            oBinding.sort(oSorter);
        },

        onGroup: function (oEvent) {
            const oTable = this.byId("productsTable");
            const oBinding = oTable.getBinding("items");
            const sSelectedKey = oEvent.getParameter("selectedItem").getKey();

            let oSorter;
            switch (sSelectedKey) {
                case "category":
                    oSorter = new Sorter("Category/CategoryName", false, (oContext) => {
                        const sCategoryName = oContext.getProperty("Category/CategoryName");
                        return {
                            key: sCategoryName,
                            text: "Category: " + sCategoryName
                        };
                    });
                    break;
                case "supplier":
                    oSorter = new Sorter("Supplier/CompanyName", false, (oContext) => {
                        const sSupplierName = oContext.getProperty("Supplier/CompanyName");
                        return {
                            key: sSupplierName,
                            text: "Supplier: " + sSupplierName
                        };
                    });
                    break;
                case "stock":
                    oSorter = new Sorter("UnitsInStock", false, (oContext) => {
                        const iStock = oContext.getProperty("UnitsInStock");
                        let sGroup;
                        if (iStock === 0) sGroup = "Out of Stock";
                        else if (iStock < 10) sGroup = "Low Stock (< 10)";
                        else if (iStock < 50) sGroup = "Medium Stock (10-49)";
                        else sGroup = "High Stock (50+)";

                        return {
                            key: sGroup,
                            text: sGroup
                        };
                    });
                    break;
                default:
                    oSorter = null;
            }

            if (oSorter) {
                oBinding.sort(oSorter);
            } else {
                oBinding.sort([]);
            }
        },

        onUpdateFinished: function (oEvent) {
            const oTable = oEvent.getSource();
            const iTotalItems = oEvent.getParameter("total");
            const oViewModel = this.getView().getModel("viewModel");

            oViewModel.setProperty("/totalProducts", iTotalItems);

            if (iTotalItems === 0) {
                oViewModel.setProperty("/noDataText", "No products found");
            }
        },

        // Formatter functions
        formatCurrency: function (fPrice) {
            if (fPrice) {
                return parseFloat(fPrice).toFixed(2);
            }
            return "0.00";
        },

        formatStockState: function (iStock) {
            if (iStock === 0) return "Error";
            if (iStock < 10) return "Warning";
            return "Success";
        },

        formatStockIcon: function (iStock) {
            if (iStock === 0) return "sap-icon://error";
            if (iStock < 10) return "sap-icon://warning";
            return "sap-icon://accept";
        }
    });
});
