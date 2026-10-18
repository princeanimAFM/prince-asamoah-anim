// Landed cost and selling price for one item bought from a designer in Ghana,
// shipped to the UK by courier, then posted to a UK customer.
// Works in the browser (window.PriceCalc) and in Node (module.exports) for tests.
(function (root) {
  'use strict';

  var UK_VAT_RATE = 0.2;
  // Consignments worth this much or less are taxed at the point of sale, not at the border.
  var LOW_VALUE_LIMIT = 135;

  function num(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  // Rounds a price up to the next whole pound minus 1p (87.32 -> 87.99).
  function roundUpToPrice(price) {
    var pence = Math.ceil(price * 100);
    var pounds = Math.ceil((pence + 1) / 100);
    return Math.max(pounds - 0.01, 0.99);
  }

  function calculate(input) {
    var i = input || {};
    var vatRegistered = !!i.vatRegistered;
    var courierIncludesTaxes = !!i.courierIncludesTaxes;
    var hasOriginProof = !!i.hasOriginProof;

    var designerPrice = num(i.designerPrice);
    var ghsPerGbp = num(i.ghsPerGbp);
    var priceInCedis = i.currency === 'GHS';
    var itemCost = priceInCedis ? (ghsPerGbp ? designerPrice / ghsPerGbp : 0) : designerPrice;

    var transferFee = itemCost * num(i.transferFeePct) / 100;
    var freight = num(i.weightKg) * num(i.courierPerKg);
    var customsValue = itemCost + freight;

    var dutyRate = courierIncludesTaxes || hasOriginProof ? 0 : num(i.dutyPct) / 100;
    var duty = customsValue * dutyRate;
    var importVat = courierIncludesTaxes ? 0 : (customsValue + duty) * UK_VAT_RATE;
    // A VAT-registered business claims import VAT back, so it is not a cost.
    var importVatCost = vatRegistered ? 0 : importVat;

    var packaging = num(i.packaging);
    var ukDelivery = num(i.ukDelivery);
    var costs = itemCost + transferFee + freight + duty + importVatCost + packaging + ukDelivery;

    var feeRate = num(i.paymentFeePct) / 100;
    var feeFixed = num(i.paymentFeeFixed);
    var deliveryCharge = num(i.deliveryCharge);
    var margin = num(i.targetMarginPct) / 100;

    // Gross takings G (item + delivery charge) that leave the target margin:
    //   not registered: G - fee(G) - costs = margin * G
    //   registered:     G/1.2 - fee(G) - costs = margin * G/1.2
    var divisor = vatRegistered
      ? (1 - margin) / (1 + UK_VAT_RATE) - feeRate
      : 1 - feeRate - margin;
    var suggestedPrice = null;
    if (divisor > 0) {
      var gross = (costs + feeFixed) / divisor;
      suggestedPrice = roundUpToPrice(Math.max(gross - deliveryCharge, 0));
    }

    var chosen = num(i.sellingPrice);
    var sellingPrice = chosen || suggestedPrice || 0;
    var takings = sellingPrice + deliveryCharge;
    var paymentFee = takings ? takings * feeRate + feeFixed : 0;
    var outputVat = vatRegistered ? takings - takings / (1 + UK_VAT_RATE) : 0;
    var netTakings = takings - outputVat;
    var profit = takings - outputVat - paymentFee - costs;

    var notes = [];
    if (priceInCedis && !ghsPerGbp) notes.push('needsRate');
    if (divisor <= 0) notes.push('marginTooHigh');
    if (!courierIncludesTaxes) notes.push('lowValueShipments');
    if (vatRegistered) notes.push('enterCostsWithoutVat');

    return {
      itemCost: itemCost,
      transferFee: transferFee,
      freight: freight,
      customsValue: customsValue,
      dutyRate: dutyRate,
      duty: duty,
      importVat: importVat,
      importVatCost: importVatCost,
      importVatReclaimed: vatRegistered ? importVat : 0,
      packaging: packaging,
      ukDelivery: ukDelivery,
      costs: costs,
      suggestedPrice: suggestedPrice,
      sellingPrice: sellingPrice,
      usingSuggestedPrice: !chosen,
      deliveryCharge: deliveryCharge,
      takings: takings,
      paymentFee: paymentFee,
      outputVat: outputVat,
      profit: profit,
      marginPct: netTakings > 0 ? (profit / netTakings) * 100 : 0,
      notes: notes
    };
  }

  var api = {
    calculate: calculate,
    roundUpToPrice: roundUpToPrice,
    UK_VAT_RATE: UK_VAT_RATE,
    LOW_VALUE_LIMIT: LOW_VALUE_LIMIT
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PriceCalc = api;
})(this);
