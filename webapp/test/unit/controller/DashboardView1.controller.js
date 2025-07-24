/*global QUnit*/

sap.ui.define([
	"project3/controller/DashboardView1.controller"
], function (Controller) {
	"use strict";

	QUnit.module("DashboardView1 Controller");

	QUnit.test("I should test the DashboardView1 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
