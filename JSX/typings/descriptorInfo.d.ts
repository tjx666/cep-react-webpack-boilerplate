declare type LayerDesc = import('./descriptorInfo/index').LayerDesc;
declare type TextKey = LayerDesc['textKey'];
declare type TextStyleRange = TextKey['textStyleRange'];
declare type TextStyle = TextStyleRange[number]['textStyle'];
declare type LayerAdjustment = LayerDesc['adjustment'][number];
declare type StrokeStyleInfo = LayerDesc['AGMStrokeStyleInfo'];
