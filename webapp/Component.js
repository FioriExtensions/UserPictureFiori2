(function() {
	"use strict";

	/*global jQuery, sap */
	jQuery.sap.declare("cis.FLPugin.Component");
	jQuery.sap.require("sap.ui.core.Component");

	var sComponentName = "cis.FLPugin";

	// new Component
	sap.ui.core.Component.extend("cis.FLPugin.Component", {

		metadata: {
			version: "@version@",
			library: "sap.ushell.demo.UIPluginSampleAddHeaderItems"
		},
		_getRenderer: function() {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oShellContainer,
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function(oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		},

		init: function() {
			var that = this,
				fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
			this.oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");

			this._getRenderer().fail(function(sErrorMessage) {
					jQuery.sap.log.error(sErrorMessage, undefined, sComponentName);
				})
				.done(function(oRenderer) {

					var imageSource = "https://outlook.office365.com/owa/service.svc/s/GetPersonaPhoto?email=" + sap.ushell.Container.getService(
						"UserInfo").getUser().getEmail();

					$("<img/>")
						.on("load", function() {
							//Below is for the small icon on top right
							$("#meAreaHeaderButton").html("<img style='max-width: 100%; height:auto;' src=" + imageSource + ">");

							//Below is for the Me area
							var biggerImage = imageSource + "&UA=0&size=HR96x96";
							sap.ushell.Container.getService("UserInfo").getUser().setImage(biggerImage);
						})
						.on("error", function() {
							console.log("error loading image");
						})
						.attr("src", imageSource);
				});
		},

		exit: function() {
			if (this._oShellContainer && this._onRendererCreated) {
				this._oShellContainer.detachRendererCreatedEvent(this._onRendererCreated);
			}
		}
	});
})();