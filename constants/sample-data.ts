
export const SAMPLE_CODIA_DATA = {
  "code": 0,
  "message": "ok",
  "data": {
    "configuration": {
      "baseWidth": 1440,
      "baseHeight": 960
    },
    "visualElement": {
      "elementId": "root",
      "elementType": "Layer",
      "styleConfig": { "widthSpec": { "value": 1440 }, "heightSpec": { "value": 960 } },
      "childElements": [
        {
          "elementId": "img-background",
          "elementType": "Image",
          "elementName": "background_image",
          "layoutConfig": { "absoluteAttrs": { "coord": [0, 0] } },
          "styleConfig": {
            "widthSpec": { "value": 1440 },
            "heightSpec": { "value": 960 }
          },
          "contentData": {
            "imageSource": "https://picsum.photos/1440/960?grayscale"
          }
        },
        {
          "elementId": "text-title",
          "elementType": "Text",
          "layoutConfig": {
            "absoluteAttrs": { "coord": [490, 200] }
          },
          "styleConfig": {
            "widthSpec": { "value": 460 },
            "heightSpec": { "value": 150 },
            "textColor": { "rgbValues": [255, 255, 255] },
            "textConfig": {
              "fontFamilyRec": "Montserrat",
              "fontFamily": "Montserrat",
              "fontSize": 80,
              "fontStyle": "bold",
              "textAlign": ["horizontal_align_center", "center"]
            }
          },
          "contentData": {
            "textValue": "EDIT ME"
          }
        },
        {
          "elementId": "text-subtitle",
          "elementType": "Text",
          "layoutConfig": {
            "absoluteAttrs": { "coord": [420, 380] }
          },
          "styleConfig": {
            "widthSpec": { "value": 600 },
            "heightSpec": { "value": 80 },
            "textColor": { "rgbValues": [230, 230, 230] },
            "textConfig": {
              "fontFamilyRec": "Inter",
              "fontFamily": "Inter",
              "fontSize": 24,
              "fontStyle": "normal",
              "textAlign": ["horizontal_align_center", "center"]
            }
          },
          "contentData": {
            "textValue": "Double click any text to start editing. Use the toolbar to change styles."
          }
        },
        {
            "elementId": "img-logo-1",
            "elementType": "Image",
            "elementName": "logo_foreground",
            "layoutConfig": { "absoluteAttrs": { "coord": [100, 750] } },
            "styleConfig": {
              "widthSpec": { "value": 200 },
              "heightSpec": { "value": 100 }
            },
            "contentData": {
              "imageSource": "https://picsum.photos/200/100?random=1"
            }
        },
        {
            "elementId": "img-logo-2",
            "elementType": "Image",
            "elementName": "logo_foreground",
            "layoutConfig": { "absoluteAttrs": { "coord": [1140, 750] } },
            "styleConfig": {
              "widthSpec": { "value": 200 },
              "heightSpec": { "value": 100 }
            },
            "contentData": {
              "imageSource": "https://picsum.photos/200/100?random=2"
            }
        },
        {
            "elementId": "rect-overlay",
            "elementType": "Layer",
            "layoutConfig": { "absoluteAttrs": { "coord": [0,0] } },
            "styleConfig": {
                "widthSpec": { "value": 1440 },
                "heightSpec": { "value": 960 },
                "textColor": { "rgbValues": [0,0,0] },
                "opacityLevel": 80
            }
        }
      ]
    }
  }
};
