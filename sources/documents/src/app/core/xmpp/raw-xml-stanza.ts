/**
 * A JXT-Extension, that adds a `rawXML` property
 * to the pubsub item, enabling to parse and serialize
 * any XML payload.
 */
export function RawXmlStanzaAddOn(_, JXT) {
  const XMLExtension = {
    get: function () {

      const data = this.xml.children;
      if (data) {
        return this.xml.children.toString();
      }
    },
    set: function (value) {
      if (value) {
        const parsed = JXT.utils.parse(value);
        this.xml.appendChild(parsed);
      }
    }
  };


  JXT.withPubsubItem((Item) => {
    JXT.add(Item, 'rawXML', XMLExtension);
  });
}
