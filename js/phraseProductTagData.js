const BarcodeScanValidateField = {
  PRODUCT_TAG_TYPE: { fieldNo: "01" },
  PRODUCT_NAME: { fieldNo: "02" },
  ARTICLE_NO: { fieldNo: "03" },
  BARCODE: { fieldNo: "04" },
  UNIT: { fieldNo: "05" },
  RETAIL_PRICE: { fieldNo: "06" },
  REF_NUMBER: { fieldNo: "07" },
  PROMOTION_NAME: { fieldNo: "08" },
  PROMOTION_PRICE: { fieldNo: "09" },
  EFFECTIVE_DATE: { fieldNo: "10" },
  EXPIRE_DATE: { fieldNo: "11" },
  SHELF_NO: { fieldNo: "12" },
  MASTER_ID: { fieldNo: "13" },
  VERSION: { fieldNo: "14" },
  SHELF_LABEL: { fieldNo: "15" },

  findByFieldNo: function (fieldNo) {
    return Object.entries(this)
      .filter(
        ([key, value]) => typeof value === "object" && value.fieldNo === fieldNo
      )
      .map(([key, value]) => ({ key, ...value }))[0];
  },
};

const BarcodeScanTagType = {
  REGULAR: { tagCode: "01" },
  PROMOTION: { tagCode: "02" },
  REDUCE_TO_CLEAR: { tagCode: "03" },
};

class BarcodeScanValidateManager {
  /**
   * Validates a barcode string
   * @param {string} plainText - The barcode text to validate
   * @returns {Object} - The validated scan model
   */
  validateBarcode(plainText) {
    const splitTextInputIntoField = this.splitTextInputIntoField(plainText);

    return this.validateInputType(splitTextInputIntoField, plainText);
  }

  /**
   * Validates the input type and returns appropriate model
   * @param {Object} splitTextResult - Result from splitting text
   * @param {string} plainText - Original plain text
   * @returns {Object} - The appropriate scan validate model
   */
  validateInputType(splitTextResult, plainText) {
    const result = splitTextResult.success ? splitTextResult.value : null;
    const productTag = result
      ? result[BarcodeScanValidateField.PRODUCT_TAG_TYPE.fieldNo]
      : null;

    if (productTag === BarcodeScanTagType.REGULAR.tagCode) {
      return {
        type: "REGULAR",
        articleNo: result[BarcodeScanValidateField.ARTICLE_NO.fieldNo] || "",
        barcode: result[BarcodeScanValidateField.BARCODE.fieldNo] || "",
        unit: result[BarcodeScanValidateField.UNIT.fieldNo] || "",
        retailPrice: this.parseRetailPrice(
          result[BarcodeScanValidateField.RETAIL_PRICE.fieldNo] || ""
        ),
        shelfNo: result[BarcodeScanValidateField.SHELF_NO.fieldNo] || null,
        masterId: result[BarcodeScanValidateField.MASTER_ID.fieldNo] || "",
        version: result[BarcodeScanValidateField.VERSION.fieldNo] || "",
        shelfLabel: result[BarcodeScanValidateField.SHELF_LABEL.fieldNo] || "",
      };
    } else if (productTag === BarcodeScanTagType.PROMOTION.tagCode) {
      return {
        type: "PROMOTION",
        barcode: result[BarcodeScanValidateField.BARCODE.fieldNo] || "",
        promotionNo: result[BarcodeScanValidateField.REF_NUMBER.fieldNo] || "",
        shelfNo: result[BarcodeScanValidateField.SHELF_NO.fieldNo] || null,
        shelfLabel: result[BarcodeScanValidateField.SHELF_LABEL.fieldNo] || "",
      };
    } else if (productTag === BarcodeScanTagType.REDUCE_TO_CLEAR.tagCode) {
      return {
        type: "REDUCE_TO_CLEAR",
        rtcUniqueCode:
          result[BarcodeScanValidateField.REF_NUMBER.fieldNo] || "",
        expireDate: result[BarcodeScanValidateField.EXPIRE_DATE.fieldNo] || "",
      };
    } else {
      // Handle special cases
      if (plainText.endsWith(".00")) {
        return {
          type: "REDUCE_TO_CLEAR",
          rtcUniqueCode: plainText,
        };
      } else {
        return {
          type: "Normal",
          plainText: plainText,
        };
      }
    }
  }

  /**
   * Splits the barcode text into fields
   * @param {string} barcode - The barcode to split
   * @returns {Object} - Result object with success flag and value/error
   */
  splitTextInputIntoField(barcode) {
    let pivot = 0;

    try {
      const hashMap = {};

      while (pivot < barcode.length) {
        // Get field number
        const fieldNo = barcode.substring(pivot, pivot + 2);
        pivot += 2;

        // Get field length
        const fieldLength = parseInt(barcode.substring(pivot, pivot + 2), 10);
        pivot += 2;

        // Get field text
        const text = barcode.substring(pivot, pivot + fieldLength);
        pivot += fieldLength;

        // Store in hashmap
        hashMap[fieldNo] = text;
      }

      return { success: true, value: hashMap };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  /**
   * Parses retail price text to a number with decimal places
   * @param {string} rspText - The retail price text
   * @returns {number} - Parsed price with 2 decimal places
   */
  parseRetailPrice(rspText) {
    if (!rspText || rspText.length === 0) {
      return 0.0;
    }

    const withDecimal = rspText.slice(0, -2) + "." + rspText.slice(-2);
    return parseFloat(parseFloat(withDecimal).toFixed(2));
  }
}

function phraseProductTag(input) {
  const manager = new BarcodeScanValidateManager();

  return manager.validateBarcode(input);
}

window.phraseProductTag = phraseProductTag;

