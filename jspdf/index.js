var jsPDF = require('./jspdf');

// load addImage plugin and jsPDF API
require('./jspdf.plugin.addimage');

// load PNG plugin and update jsPDF API
require('./jspdf.plugin.png_support');

module.exports = jsPDF;
