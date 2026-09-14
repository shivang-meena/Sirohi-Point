# Sirohi Point — HSN Review List (provisional)

**Status:** Verification document only. No application code or database was changed.

**Source:** Current product seed at `apps/api/prisma/sirohipoint-products.seed.ts` — 253 product entries. Duplicate product names are kept because they are separate seed entries.

**Important:** These are candidate headings for review, not final tax advice. Exact HSN can change based on material, composition, intended use, voltage, construction and whether an item is a component, fitting or complete appliance. The GST rate column is provisional and should be rechecked against the applicable rate notification on implementation date.

**Tax logic for later billing:** Shop/organisation state will remain fixed. If customer state is the same, calculate CGST + SGST; if different, calculate IGST. The HSN/rate must be resolved per product line before calculating tax.

| # | Category | Product | Candidate HSN | Provisional GST | Confidence | Verify before approval |
|---:|---|---|---|---|---|---|
| 1 | Others | Plug 1/2 ^ | 3917 / 8536 | 18% | Low | PVC pipe plug vs electrical plug must be separated |
| 2 | Others | Cpvc Plug 1/2 ^ | 3917 / 8536 | 18% | Low | PVC pipe plug vs electrical plug must be separated |
| 3 | PVC PIPE | Coupler Socket Apl Apollo 1/2^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 4 | PVC PIPE | Coupler Socket Padmavati 1/2^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 5 | PVC PIPE | Coupler, Socket 3/4 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 6 | Hardware | Pata Bolt | 7318 | 18% | High | Confirm iron/steel threaded fastener |
| 7 | Electrical | Bijli Bend 25mm Eco | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 8 | PVC PIPE | Elbow 3/4 Inch Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 9 | PVC PIPE | Coupler Socket 3/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 10 | Electrical | Bijli Bend 25mm MED | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 11 | PVC PIPE | Upvc Elbow Apl Apollo 1/2 | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 12 | PVC PIPE | Coupler Socket Apl Apollo 3/4^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 13 | Electrical | Switch | 8536 / 8537 | 18% | Medium | Use 8536 for apparatus; 8537 only if a populated control/distribution board |
| 14 | PVC PIPE | Cpvc End Cap 3/4 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 15 | PVC PIPE | Cpvc Elbow 45* 3/4 Padmvati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 16 | PVC PIPE | Cpvc End Cap 1^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 17 | PVC PIPE | Upvc FTA 3/4 Pvc | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 18 | PVC PIPE | Cpvc Elbow 3/4 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 19 | PVC PIPE | Upvc MTA Pvc 1^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 20 | PVC PIPE | Upvc End CAP 3/4 Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 21 | PVC PIPE | Upvc MTA 3/4 pvc Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 22 | PVC PIPE | Upvc Elobow Apl Apollo 45* 3/4 | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 23 | PVC PIPE | Upvc Elbow Padmavati 1/2 | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 24 | PVC PIPE | Upvc Elbow Apl Apollo 3/4^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 25 | PVC PIPE | Upvc Tee Apl Apollo 1/2^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 26 | PVC PIPE | Upvc Tee Padmavati  1/2^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 27 | PVC PIPE | Coupler Socket Padmavati 1^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 28 | PVC PIPE | Upvc Elobow Padmavati 45* 3/4 | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 29 | PVC PIPE | Tee 3/4 Inch Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 30 | Electrical | Switch Modular | 8536 / 8537 | 18% | Medium | Use 8536 for apparatus; 8537 only if a populated control/distribution board |
| 31 | PVC PIPE | Coupler Socket 1^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 32 | PVC PIPE | Upvc FTA Pvc 1^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 33 | PVC PIPE | Coupler Socket 1^ Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 34 | PVC PIPE | Cpvc Tee 3/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 35 | PVC PIPE | Upvc Tee Apl Apollo 3/4^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 36 | PVC PIPE | Upvc FTA Pvc 1 1/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 37 | Others | Haf Climp 2^ Yuvraj Eco | 8302 / 7326 | 18% | Low | Confirm base metal and whether furniture/building fitting |
| 38 | Others | Haf Climp 3^ Yuvraj Eco | 8302 / 7326 | 18% | Low | Confirm base metal and whether furniture/building fitting |
| 39 | Others | Haf Climp 4^ Yuvraj Eco | 8302 / 7326 | 18% | Low | Confirm base metal and whether furniture/building fitting |
| 40 | Others | SS Jali 2^ Eco Holl | 7314 / 7323 | 18% | Low | Confirm stainless mesh vs household article |
| 41 | Others | SS Jali 2^ Eco | 7314 / 7323 | 18% | Low | Confirm stainless mesh vs household article |
| 42 | Sanitary | Hex 1/2 ^ | 3922 / 6910 | 18% | Low | Confirm material and sanitary-ware type |
| 43 | PVC PIPE | Upvc MTA Pvc 1 1/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 44 | PVC PIPE | Upvc Elbow Padmavati 1^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 45 | PVC PIPE | Coupler Socket Padmavati 1 1/4^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 46 | PVC PIPE | Upvc Elobow Padmavati 45* 1^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 47 | Others | Junction Box Black | 8536 / 8537 | 18% | Medium | Use 8536 for apparatus; 8537 only if a populated control/distribution board |
| 48 | Electrical | Socket Sada | 8536 / 8537 | 18% | Medium | Use 8536 for apparatus; 8537 only if a populated control/distribution board |
| 49 | PVC PIPE | Cpvc Elbow 1 ^Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 50 | PVC PIPE | Cpvc Elbow 45* 1^ Padmvati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 51 | Electrical | Juction Box | 8536 / 8537 | 18% | Medium | Use 8536 for apparatus; 8537 only if a populated control/distribution board |
| 52 | PVC PIPE | Cpvc Elbow 1 ^ Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 53 | PVC PIPE | Cpvc Elbow 45* 1^ Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 54 | PVC PIPE | Upvc Tee Padmavati  1^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 55 | Others | Atta Chaki Gala Handle | 8509 | 18% | Medium | Confirm domestic electro-mechanical appliance with self-contained motor |
| 56 | Electrical | Rocker Swich Submersible | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 57 | PVC PIPE | PVC Elbow Pn4 2^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 58 | PVC PIPE | Upvc Union Padmavati 1/2^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 59 | PVC PIPE | Coupler Socket 1 1/4 ^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 60 | Others | SS Jali 4^ Eco Holl | 7314 / 7323 | 18% | Low | Confirm stainless mesh vs household article |
| 61 | PVC PIPE | Yuvraj Elbow 2^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 62 | Others | SS Jali 4^ Eco | 7314 / 7323 | 18% | Low | Confirm stainless mesh vs household article |
| 63 | PVC PIPE | Upvc Elbow Padmavati 1 1/4^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 64 | PVC PIPE | Cpvc Tee 1^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 65 | PVC PIPE | Cpvc Tee 1^ Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 66 | PVC PIPE | PVC Coupler Socket 2^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 67 | Others | Kitchen Knife | 8211 | 18% | Medium | Confirm knife type and blade/material |
| 68 | PVC PIPE | Union 3/4 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 69 | Electrical | Moduler Socket | 8536 / 8537 | 18% | Medium | Use 8536 for apparatus; 8537 only if a populated control/distribution board |
| 70 | PVC PIPE | PVC Coupler Socket 3^ Yuvraj | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 71 | Hardware | Kani No 4 | 8201 | 18% | Low | Confirm exact agricultural hand tool and blade design |
| 72 | PVC PIPE | Upvc Union Apl Apollo 3/4^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 73 | Others | SS Jali 3^ Cross Hexa | 7314 / 7323 | 18% | Low | Confirm stainless mesh vs household article |
| 74 | Others | SS Jali 4^ Cross Hexa | 7314 / 7323 | 18% | Low | Confirm stainless mesh vs household article |
| 75 | PVC PIPE | Cpvc Tank Nipple 3/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 76 | PVC PIPE | Yuvraj Elbow 3^ Eco | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 77 | PVC PIPE | Upvc Tee Padmavati  1 1/4^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 78 | PVC PIPE | Reducer Coupler Socket 3x2 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 79 | PVC PIPE | Socket 3^ Yuvraj | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 80 | Sanitary | Wast Jali Pvc | 3917 / 3922 / 7307 | 18% | Low | Confirm plastic/steel and whether pipe or sanitary article |
| 81 | Sanitary | Ex Nipple Ss 1.5^ | 8481 / 7307 / 7412 | 18% | Low | Confirm valve vs iron/steel vs copper/brass fitting |
| 82 | Electrical | Diamond 3 Pin Top 6 Amp | 8536 / 8537 | 18% | Medium | Use 8536 for apparatus; 8537 only if a populated control/distribution board |
| 83 | PVC PIPE | PVC Elbow Eco 3^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 84 | Hardware | Handle Datri | 8201 | 18% | Low | Confirm exact agricultural hand tool and blade design |
| 85 | Hardware | Handle Datri | 8201 | 18% | Low | Confirm exact agricultural hand tool and blade design |
| 86 | PVC PIPE | Cpvc Union 3/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 87 | PVC PIPE | Upvc Union Padmavati 1^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 88 | PVC PIPE | Cpvc Elbow 1 1/4 ^Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 89 | PVC PIPE | Reducer Coupler Socket 4x3 Yuvarj | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 90 | PVC PIPE | Upvc FTA Brass 3/4 x 1/2 Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 91 | PVC PIPE | Reducer Coupler Socket 4x2 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 92 | PVC PIPE | Upvc Step Over Bend 3/4 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 93 | PVC PIPE | PVC Coupler Socket 4^ Yuvraj | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 94 | PVC PIPE | Upvc Elbow Brass 1/2 x 1/2 Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 95 | Hardware | Bike Rope 10N | 5607 / 7315 | 18% | Low | Confirm rope material vs metal cable/chain |
| 96 | PVC PIPE | PVC Coupler Socket 3^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 97 | Sanitary | Ex Nipple Ss 2^ | 8481 / 7307 / 7412 | 18% | Low | Confirm valve vs iron/steel vs copper/brass fitting |
| 98 | PVC PIPE | Yuvraj Elbow 4^ Eco | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 99 | PVC PIPE | Cpvc Brass 3/4 x 1/2 Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 100 | Others | Gag Lighter | 9613 | 18% | High | Confirm gas lighter classification |
| 101 | PVC PIPE | Cpvc Tank Nipple 1^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 102 | PVC PIPE | Cpvc FTA 3/4 X 1/2 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 103 | PVC PIPE | Upvc TEE Brass 1/2 x 1/2 Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 104 | PVC PIPE | Upvc Elbow Brass 3/4 x 1/2 Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 105 | PVC PIPE | Upvc FTA Brass 3/4 x 1/2 Apl Apollo | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 106 | PVC PIPE | Upvc Step Over Bend 3/4 Apl Apollo Socket | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 107 | PVC PIPE | Cpvc Tee 1 1/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 108 | Sanitary | Wast Pipe Rn | 3917 / 3922 / 7307 | 18% | Low | Confirm plastic/steel and whether pipe or sanitary article |
| 109 | PVC PIPE | Upvc TEE Brass 3/4 x 1/2 Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 110 | PVC PIPE | Upvc Elbow Brass 3/4 x 1/2 Apl Apollo | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 111 | PVC PIPE | Upvc Ballvale Rn | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 112 | PVC PIPE | Upvc MTA Brass Padmavati 3/4 x1/2 | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 113 | PVC PIPE | Cpvc  Step Over Bend 3/4 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 114 | PVC PIPE | Socket 4^ Yuvraj | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 115 | PVC PIPE | Yuvraj TEE 4^ Eco | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 116 | PVC PIPE | Cpvc Tank Nipple 1^ Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 117 | PVC PIPE | Cpvc FTA 1 x 1/2 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 118 | PVC PIPE | Cpvc Union 1^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 119 | Sanitary | Ex Nipple Ss 2.5^ | 8481 / 7307 / 7412 | 18% | Low | Confirm valve vs iron/steel vs copper/brass fitting |
| 120 | PVC PIPE | PVC Coupler Socket 4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 121 | PVC PIPE | Upvc Union Padmavati 1 1/4^ | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 122 | PVC PIPE | Reducer Coupler Socket 4x3 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 123 | PVC PIPE | PVC Elbow Eco 4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 124 | Sanitary | Kani No 2 | 8201 | 18% | Low | Confirm exact agricultural hand tool and blade design |
| 125 | Electrical | Diamond 3 Pin Top 16 Amp | 8536 / 8537 | 18% | Medium | Use 8536 for apparatus; 8537 only if a populated control/distribution board |
| 126 | PVC PIPE | Upvc TEE Brass 3/4 x 1/2 Apl Apollo | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 127 | PVC PIPE | Cpvc Union 1^ Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 128 | PVC PIPE | Cpvc FTA 1 x 1/2 Brass Apl Apollo | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 129 | PVC PIPE | Cpvc MTA 3/4 X1/2 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 130 | PVC PIPE | Upvc FTA Brass 3/4 x 3/4 Apl Apollo | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 131 | PVC PIPE | Cpvc MTA 3/4 X1/2 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 132 | PVC PIPE | Cpvc Brass 1 x 1/2 Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 133 | PVC PIPE | Cpvc Brass 1 x 1/2 Apl Apollo | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 134 | Electrical | Bulb 9Watt LED | 8539 | 18% | Medium | Confirm lamp/LED classification and exact subheading |
| 135 | Hardware | Iron KADA Kg | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 136 | Sanitary | Ex Nipple Ss 3^ | 8481 / 7307 / 7412 | 18% | Low | Confirm valve vs iron/steel vs copper/brass fitting |
| 137 | Others | Coffee Mug | 6912 / 3924 / 7323 | 18% | Low | Material decides ceramic/plastic/metal heading |
| 138 | PVC PIPE | Upvc Elbow Brass 3/4 x 3/4 Apl Apollo | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 139 | Hardware | Kani No 0 | 8201 | 18% | Low | Confirm exact agricultural hand tool and blade design |
| 140 | Hardware | Kani No 1 | 8201 | 18% | Low | Confirm exact agricultural hand tool and blade design |
| 141 | PVC PIPE | Cpvc Tank Nipple 1 1/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 142 | PVC PIPE | Cpvc FTA 1 x 3/4 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 143 | Others | Gas Lighter Black | 9613 | 18% | High | Confirm gas lighter classification |
| 144 | Hardware | Hanger Yuvraj | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 145 | PVC PIPE | Cpvc FTA 3/4 X 3/4 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 146 | PVC PIPE | Cpvc  Step Over Bend 1^  Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 147 | PVC PIPE | Cpvc MTA 1 x1/2 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 148 | PVC PIPE | PVC Coupler Socket 4^ Apl Apollo Havey 6kg | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 149 | PVC PIPE | Cpvc  Step Over Bend 1^ Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 150 | Hardware | Nut Bolt Kg | 7318 | 18% | High | Confirm iron/steel threaded fastener |
| 151 | PVC PIPE | Cpvc MTA 3/4 X3/4 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 152 | PVC PIPE | Cpvc Union 1 1/4^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 153 | Others | Water Bottel | 3923 / 3926 | 18% | Low | Confirm bottle is packaging container or reusable household article |
| 154 | PVC PIPE | Upvc MTA Brass Apl Apollo 3/4 x 3/4 | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 155 | Others | Atta Chaki Gala Nob | 8509 | 18% | Medium | Confirm domestic electro-mechanical appliance with self-contained motor |
| 156 | PVC PIPE | Cpvc MTA 1 x 3/4 Brass Padmavati | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 157 | PVC PIPE | PVC Coupler Socket 5^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 158 | PVC PIPE | Reducer Coupler Socket 4x5 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 159 | Sanitary | Cermics 10x Clean 1LTR Yuvraj | 3402 / 3824 | 18% | Low | Confirm chemical composition and intended use |
| 160 | PVC PIPE | Cpvc MTA 1 x 3/4 Brass Apl Apollo | 8481 / 7412 | 18% | Low | Confirm whether it is a valve or brass pipe fitting |
| 161 | Hardware | Iron Chain | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 162 | PVC PIPE | Cpvc Ball Valve 3/4 Padmavati | 8481 | 18% | Medium | Confirm valve material and whether valve is plastic/metal |
| 163 | Paint | Brush | 9603 | 18% | High | Confirm paint brush type/material |
| 164 | PVC PIPE | Cpvc Solvent 118ml Apollo | 3506 | 18% | Medium | Confirm whether PVC solvent is adhesive/preparation and exact composition |
| 165 | Sanitary | Tap Rn | 8481 / 7307 / 7412 | 18% | Low | Confirm valve vs iron/steel vs copper/brass fitting |
| 166 | Hardware | Tawa Iron 1kg Plus | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 167 | Paint | MTO Berger 1 Ltr | 3208 / 3209 / 3210 | 18% | Medium | Confirm water/solvent base and coating composition |
| 168 | PVC PIPE | First End Cap 200mm | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 169 | Electrical | Diamond Led Bulb Combo 4Pic | 8539 | 18% | Medium | Confirm lamp/LED classification and exact subheading |
| 170 | PVC PIPE | PVC Coupler Socket 6^ Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 171 | PVC PIPE | Cpvc Padmavati 3/4^ 11 SDR | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 172 | PVC PIPE | Yuvraj Ptrap 110x 110mm Pvc | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 173 | Paint | Nerolac Primer 1ltr | 3208 / 3209 / 3210 | 18% | Medium | Confirm water/solvent base and coating composition |
| 174 | PVC PIPE | Upvc Pipe 1/2 SCH40 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 175 | Hardware | Tank Cover Nukila | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 176 | Electrical | Pvc Tap | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 177 | PVC PIPE | Cpvc Ball Valve 1^ Padmavati | 8481 | 18% | Medium | Confirm valve material and whether valve is plastic/metal |
| 178 | Others | Hanger SS | 8302 / 7326 | 18% | Low | Confirm base metal and whether furniture/building fitting |
| 179 | PVC PIPE | Yuvraj End Cap 225mm | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 180 | Hardware | PYE Pliers | 8203 | 18% | High | Confirm hand-operated pliers/cutters |
| 181 | Sanitary | Sink Wast Jali Square | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 182 | Sanitary | Angle Vale Rn ss | 3922 / 6910 | 18% | Low | Confirm material and sanitary-ware type |
| 183 | Electrical | Extancon Boad | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 184 | PVC PIPE | Cpvc Ball Valve  1^Apl Apollo | 8481 | 18% | Medium | Confirm valve material and whether valve is plastic/metal |
| 185 | PVC PIPE | Upvc Pipe 1/2 SCH80 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 186 | Paint | Nerolac Paint 1ltr | 3208 / 3209 / 3210 | 18% | Medium | Confirm water/solvent base and coating composition |
| 187 | Sanitary | Helath Faucet RN | 8481 / 7307 / 7412 | 18% | Low | Confirm valve vs iron/steel vs copper/brass fitting |
| 188 | PVC PIPE | Upvc Pipe 3/4 SCH40 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 189 | PVC PIPE | Cpvc Padmavati 1^ 11 SDR | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 190 | Hardware | Taparia Pliers | 8203 | 18% | High | Confirm hand-operated pliers/cutters |
| 191 | PVC PIPE | Upvc Pipe 3/4 SCH40 Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 192 | PVC PIPE | Cpvc Apl Apollo 1^ 11SDR | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 193 | Electrical | Fix 4076 Aly | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 194 | PVC PIPE | Cpvc Ball Valve 1 1/4 Padmavati | 8481 | 18% | Medium | Confirm valve material and whether valve is plastic/metal |
| 195 | Hardware | Khatpawdi Iron | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 196 | Electrical | Immersion Water Heater Rod | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 197 | Sanitary | Shower 6 Inch | 8481 / 7307 / 7412 | 18% | Low | Confirm valve vs iron/steel vs copper/brass fitting |
| 198 | PVC PIPE | Upvc Pipe 3/4 SCH80 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 199 | Sanitary | Hindi Tolit Seat | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 200 | PVC PIPE | Upvc Pipe 3/4 SCH80 Apl Apollo | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 201 | Electronics | Torch 1W | 8513 | 18% | Medium | Confirm portable electric lamp specification |
| 202 | Hardware | Khatpawdi Iron | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 203 | Paint | Indigo Putty 20Kg | 3214 | 18% | High | Confirm wall putty/surfacing preparation composition |
| 204 | PVC PIPE | Cpvc Padmavati 1 1/4^ 11 SDR | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 205 | Electrical | Fix 2376 Copper | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 206 | Electronics | Torch 3W | 8513 | 18% | Medium | Confirm portable electric lamp specification |
| 207 | Hardware | Khatpawdi Steel | 8201 | 18% | Low | Confirm exact agricultural hand tool and blade design |
| 208 | Sanitary | Long Body Brass Yuvraj Eco | 3922 / 6910 | 18% | Low | Confirm material and sanitary-ware type |
| 209 | PVC PIPE | Upvc Pipe 1 1/4 SCH40 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 210 | PVC PIPE | Upvc Pipe 1^ SCH80 Padmavati | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 211 | Electrical | Immersion Water Heater Rod  Halonix 2year | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 212 | Sanitary | Yuvraj Cistern Hand Flush Slim | 3922 / 6910 | 18% | Low | Confirm material and sanitary-ware type |
| 213 | Sanitary | Concealed 3/4^ Brass Eco Yuvraj | 8539 | 18% | Medium | Confirm lamp/LED classification and exact subheading |
| 214 | Electrical | Fix 4076 Copper | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 215 | Sanitary | Sink 24 X18 | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 216 | Electronics | RR Iron | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 217 | Electronics | Iron Havells | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 218 | Electronics | Cropmton Iron | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 219 | Hardware | Mittal Files Box | 8203 / 8205 | 18% | Medium | Confirm hand file/rasp classification |
| 220 | Electronics | Torch 5W | 8513 | 18% | Medium | Confirm portable electric lamp specification |
| 221 | Electrical | Conduct Pipe Yuvraj Jiri 9.5 kg Bundal | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 222 | Others | Aata Chakki Cutter Heavy | 8509 | 18% | Medium | Confirm domestic electro-mechanical appliance with self-contained motor |
| 223 | Others | Aata Chakki Cutter SS Heavy | 8509 | 18% | Medium | Confirm domestic electro-mechanical appliance with self-contained motor |
| 224 | Electronics | Hair Dryer Havells | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 225 | Sanitary | Wash Basin | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 226 | Electrical | Conduct Pipe Yuvraj 11.5 kg | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 227 | Sanitary | Sink 24 X18 Havey Handmade | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 228 | Electrical | Yuvraj 1mm Wire Bundal | 8544 | 18% | High | Confirm conductor material, insulation and voltage rating |
| 229 | Sanitary | Wash Basin Havey | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 230 | Electrical | Yuvraj Panel W/F Manual  Digital | 8539 | 18% | Medium | Confirm lamp/LED classification and exact subheading |
| 231 | Sanitary | Sink 24 X18 Handmade Yuvraj | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 232 | Electrical | Conduct Pipe Yuvraj Med L Bundal | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 233 | Sanitary | Sink 24 X18 Havey | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 234 | Electrical | Yuvraj Panel W/F Auto Digital | 8539 | 18% | Medium | Confirm lamp/LED classification and exact subheading |
| 235 | Electrical | Yuvraj 1.5mm Wire Bundal | 8544 | 18% | High | Confirm conductor material, insulation and voltage rating |
| 236 | Electrical | Conduct Pipe Yuvraj Prime Heavy | To verify | 18% provisional | Low | Need material, composition, use and technical specification |
| 237 | Electrical | Wire 1.5mm | 8544 | 18% | High | Confirm conductor material, insulation and voltage rating |
| 238 | Electrical | 20 Hp Stater Submersable | 8413 / 8501 | 18% | Low | Separate pump (8413) from motor/starter (8501/8536) |
| 239 | PVC PIPE | PVC Pipes | 3917 | 18% | High | Confirm plastic type and whether product is pipe/fitting |
| 240 | Paint | Berger Wall Paint 20kg | 3208 / 3209 / 3210 | 18% | Medium | Confirm water/solvent base and coating composition |
| 241 | Electrical | Yuvraj 2.5mm Wire Bundal | 8544 | 18% | High | Confirm conductor material, insulation and voltage rating |
| 242 | Electrical | Wire 2.5mm | 8544 | 18% | High | Confirm conductor material, insulation and voltage rating |
| 243 | Sanitary | English Tolit Seat | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 244 | Others | Yuvraj MonoBlock 0.5Hp G60 | 8413 / 8501 | 18% | Low | Separate pump (8413) from motor/starter (8501/8536) |
| 245 | PVC PIPE | Yuvraj Water Tank 500LTR 3LYR White 10Y | 3925 | 18% | Medium | Confirm plastic tank construction and tariff subheading |
| 246 | Others | Yuvraj MonoBlock 1Hp G60 | 8413 / 8501 | 18% | Low | Separate pump (8413) from motor/starter (8501/8536) |
| 247 | Sanitary | Canva English Seat | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 248 | Sanitary | Backbone English Seat | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 249 | Sanitary | Nobel English Seat | 6910 / 3922 | 18% | Medium | Ceramic = 6910; plastic sanitary ware = 3922 |
| 250 | Electronics | Havells Gas Gyser Flagro | 8516 | 18% | Medium | Confirm appliance type and heating function |
| 251 | Others | Yuvraj Water Tank 1000LTR 3LYR White 10Y | 3925 | 18% | Medium | Confirm plastic tank construction and tariff subheading |
| 252 | Electronics | Atta Chaki 1.5 hp | 8509 | 18% | Medium | Confirm domestic electro-mechanical appliance with self-contained motor |
| 253 | Hardware | Chaf Cutter Machine Kalshi Toka | 8433 / 8436 | 18% | Low | Confirm exact agricultural machine function |

## Official references

- [CBIC GST Goods and Services Rates](https://cbic-gst.gov.in/hindi/gst-goods-services-rates.html) — headings/descriptions and rate entries for areas such as 3917, 3922, 6910, 3208–3214, 8535–8539.
- [CBIC GST Rates FAQ](https://cbic-gst.gov.in/gst-rates-faq.html) — confirms that classification and description matter.
- [CBIC Sectoral FAQs](https://cbic-gst.gov.in/hindi/sectoral-faq.html) — intra-state CGST+SGST and inter-state IGST treatment.

