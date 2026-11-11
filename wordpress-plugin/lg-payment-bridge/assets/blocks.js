/* Registers the card payment method with the block-based WooCommerce checkout. No build step needed. */
(function () {
  var registry = window.wc && window.wc.wcBlocksRegistry;
  var settings = window.wc && window.wc.wcSettings;
  if (!registry || !settings || !window.wp || !window.wp.element) {
    return;
  }

  var el = window.wp.element.createElement;
  var decode = window.wp.htmlEntities.decodeEntities;
  var data = settings.getSetting('lgpb_data', {});
  var title = decode(data.title || 'Credit / Debit Card');

  var Label = function (props) {
    var PaymentMethodLabel = props.components.PaymentMethodLabel;
    return el(PaymentMethodLabel, { text: title });
  };

  var Content = function () {
    return el(
      'div',
      null,
      el('div', null, decode(data.description || '')),
      data.note ? el('div', { style: { marginTop: '8px', fontWeight: 600 } }, decode(data.note)) : null
    );
  };

  registry.registerPaymentMethod({
    name: 'lgpb',
    label: el(Label, null),
    content: el(Content, null),
    edit: el(Content, null),
    canMakePayment: function () {
      return true;
    },
    ariaLabel: title,
    supports: { features: data.supports || ['products'] },
  });
})();
