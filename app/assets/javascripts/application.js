/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()

  $("[data-action='print-gp-form']").click(function(e){
  	window.open("https://www.nhs.uk/Servicedirectories/Documents/GMS1.pdf", "_blank")
  })
})
