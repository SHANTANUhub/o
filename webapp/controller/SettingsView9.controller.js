sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Configuration",
  "sap/m/MessagePopover",
  "sap/m/MessagePopoverItem",
  "sap/m/MessageToast"
], function (Controller, Configuration, MessagePopover, MessagePopoverItem, MessageToast) {
  "use strict";

  return Controller.extend("project3.controller.SettingsView9", {

    onInit: function () {
      // Initial logic if needed
    },

    onLanguageChange: function (oEvent) {
      const sLang = oEvent.getSource().getSelectedKey();
      Configuration.setLanguage(sLang);
      MessageToast.show("Language set to: " + sLang);
    },

    onThemeChange: function (oEvent) {
      const sTheme = oEvent.getSource().getSelectedKey();
      sap.ui.getCore().applyTheme(sTheme);
      MessageToast.show("Theme changed to: " + sTheme);
    },

    onShowMessages: function () {
      if (!this._oMessagePopover) {
        this._oMessagePopover = new MessagePopover({
          items: [
            new MessagePopoverItem({
              type: "Success",
              title: "Profile updated successfully",
              description: "Your profile changes were saved."
            }),
            new MessagePopoverItem({
              type: "Warning",
              title: "Storage near limit",
              description: "You are approaching your storage limit."
            }),
            new MessagePopoverItem({
              type: "Error",
              title: "Failed to save settings",
              description: "Please try again later."
            })
          ]
        });
        this.getView().addDependent(this._oMessagePopover);
      }

      this._oMessagePopover.toggle(this.byId("notificationButton"));
    }

  });
});
