module.exports= {
  schema : {
    properties: {
      "Inventory_Inquiry": {
        type: 'object',
        required: true,
        properties: {
          "business_section": {
            type: 'object',
            required: true,
            properties: {
              "item_code_list": {
                type: 'array',
                required: true,
                properties: {
                  "item_code": {
                    type: 'string',
                    required: true
                  }
                }
              }
              ,
              "summary_unit": {
                type: 'string',
                enum: ["C", "E"],
                required: true
              }
              ,
              "inventory_type_list": {
                type: 'array',
                required: true,
                properties: {
                  "inventory_type": {
                    type: 'string',
                    required: false,
                  }
                }
              }
              ,
              "inventory_status_list": {
                type: 'array',
                required: true,
                properties: {
                  "inventory_status": {
                    type: 'string',
                    required: false,
                  }
                }
              }
            }
          }
        }
      }
    }
  }

}

