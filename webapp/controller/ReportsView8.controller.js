sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v2/ODataModel"
], function (Controller, JSONModel, ODataModel) {
  "use strict";

  return Controller.extend("project3.controller.ReportsView8", {

    onInit: function () {
      const oModel = new ODataModel("http://localhost:8080/v2/northwind/northwind.svc/");
      this.getView().setModel(oModel); // optional: if needed for bindings

      this.loadTopSellingProducts(oModel);
      this.loadOrdersPerCountry(oModel);
      this.loadRevenueByMonth(oModel);
      this.loadCategories(oModel);

    },

    loadTopSellingProducts: function (oModel) {
      var that = this;
  oModel.read("/Order_Details", {
    success: function (oData) {
      const orderDetails = oData.results;

      // Aggregate quantity by ProductID
      const productSalesMap = {};
      orderDetails.forEach(item => {
        const pid = item.ProductID;
        productSalesMap[pid] = (productSalesMap[pid] || 0) + item.Quantity;
      });

      // Fetch product names to map with ID
      oModel.read("/Products", {
        success: function (productData) {
          const products = productData.results;
          const finalData = [];

          products.forEach(p => {
            if (productSalesMap[p.ProductID]) {
              finalData.push({
                ProductName: p.ProductName,
                QuantitySold: productSalesMap[p.ProductID]
              });
            }
          });

          // Sort by quantity descending and pick top 5
          finalData.sort((a, b) => b.QuantitySold - a.QuantitySold);
          const topSelling = finalData.slice(0, 5);

          // Set to JSON model for chart
          const chartModel = new sap.ui.model.json.JSONModel({ data: topSelling });
          that.getView().setModel(chartModel, "chart");
        }
      });
    }

});

    },

    loadOrdersPerCountry: function (oModel) {
      const that = this;
      oModel.read("/Orders", {
        success: function (orderData) {
          const orders = orderData.results;
          const customerIDs = [...new Set(orders.map(o => o.CustomerID))];

          oModel.read("/Customers", {
            success: function (customerData) {
              const customers = customerData.results;
              const customerMap = {};
              customers.forEach(c => {
                customerMap[c.CustomerID] = c.Country;
              });

              const countryOrderMap = {};
              orders.forEach(order => {
                const country = customerMap[order.CustomerID];
                if (country) {
                  countryOrderMap[country] = (countryOrderMap[country] || 0) + 1;
                }
              });

              const chartData = Object.keys(countryOrderMap).map(country => ({
                Country: country,
                Orders: countryOrderMap[country]
              }));

              chartData.sort((a, b) => b.Orders - a.Orders);
              const countryModel = new JSONModel({ data: chartData });
              that.getView().setModel(countryModel, "chartCountry");
            }
          });
        }
      });
    },
    loadRevenueByMonth: function (oModel) {
  const that = this;

  oModel.read("/Order_Details", {
    success: function (orderDetailsData) {
      const orderDetails = orderDetailsData.results;

      // Collect all unique OrderIDs
      const orderIDs = [...new Set(orderDetails.map(o => o.OrderID))];

      oModel.read("/Orders", {
        success: function (ordersData) {
          const orders = ordersData.results;

          // Map OrderID to OrderDate
          const orderDateMap = {};
          orders.forEach(order => {
            orderDateMap[order.OrderID] = order.OrderDate;
          });

          // Map revenue by month
          const revenueMap = {};

          orderDetails.forEach(item => {
            const orderDate = orderDateMap[item.OrderID];
            if (orderDate) {
              const dateObj = new Date(orderDate);
              const monthYear = dateObj.toLocaleString('default', { month: 'short' }) + " " + dateObj.getFullYear();

              const revenue = item.Quantity * item.UnitPrice;
              revenueMap[monthYear] = (revenueMap[monthYear] || 0) + revenue;
            }
          });

          // Convert to chart data
          const chartData = Object.keys(revenueMap).map(month => ({
            Month: month,
            Revenue: +revenueMap[month].toFixed(2)
          }));

          // Sort by time (optional)
          chartData.sort((a, b) => new Date("01 " + a.Month) - new Date("01 " + b.Month));

          const revenueModel = new sap.ui.model.json.JSONModel({ data: chartData });
          that.getView().setModel(revenueModel, "chartRevenue");
        }
      });
    }
  });
},
loadCategories: function (oModel) {
  const that = this;
  oModel.read("/Categories", {
    success: function (oData) {
      const categories = oData.results.map(c => ({
        key: c.CategoryID,
        text: c.CategoryName
      }));
      const categoryModel = new sap.ui.model.json.JSONModel(categories);
      that.getView().byId("categorySelect").setModel(categoryModel);
      that.getView().byId("categorySelect").bindItems({
        path: "/",
        template: new sap.ui.core.Item({
          key: "{key}",
          text: "{text}"
        })
      });
    }
  });
},
onApplyFilters: function () {
  const oView = this.getView();
  const oModel = oView.getModel(); // ODataModel

  const dateRange = oView.byId("dateRange").getDateValue();
  const dateRangeTo = oView.byId("dateRange").getSecondDateValue();
  const categoryID = oView.byId("categorySelect").getSelectedKey();

  this.loadFilteredRevenue(oModel, dateRange, dateRangeTo, categoryID);
},
loadFilteredRevenue: function (oModel, fromDate, toDate, categoryID) {
  const that = this;

  // 1. Get Products for category
  oModel.read("/Products", {
    success: function (productData) {
      const products = productData.results;

      // Filter by category if provided
      const productIDSet = new Set(
        products
          .filter(p => !categoryID || p.CategoryID == categoryID)
          .map(p => p.ProductID)
      );

      // 2. Get Order_Details
      oModel.read("/Order_Details", {
        success: function (orderDetailsData) {
          const orderDetails = orderDetailsData.results
            .filter(od => productIDSet.has(od.ProductID));

          const orderIDs = [...new Set(orderDetails.map(od => od.OrderID))];

          // 3. Get Orders for Date Range
          oModel.read("/Orders", {
            success: function (ordersData) {
              const orders = ordersData.results.filter(o => {
                const od = new Date(o.OrderDate);
                return orderIDs.includes(o.OrderID) &&
                  (!fromDate || od >= fromDate) &&
                  (!toDate || od <= toDate);
              });

              const orderDateMap = {};
              orders.forEach(o => {
                orderDateMap[o.OrderID] = o.OrderDate;
              });

              // 4. Aggregate Revenue by Month
              const revenueMap = {};
              orderDetails.forEach(item => {
                const orderDate = orderDateMap[item.OrderID];
                if (orderDate) {
                  const dateObj = new Date(orderDate);
                  const monthYear = dateObj.toLocaleString('default', { month: 'short' }) + " " + dateObj.getFullYear();
                  const revenue = item.Quantity * item.UnitPrice;
                  revenueMap[monthYear] = (revenueMap[monthYear] || 0) + revenue;
                }
              });

              const chartData = Object.keys(revenueMap).map(month => ({
                Month: month,
                Revenue: +revenueMap[month].toFixed(2)
              }));

              chartData.sort((a, b) => new Date("01 " + a.Month) - new Date("01 " + b.Month));
              const revenueModel = new sap.ui.model.json.JSONModel({ data: chartData });
              that.getView().setModel(revenueModel, "chartRevenue");
            }
          });
        }
      });
    }
  });
},




  });
});



