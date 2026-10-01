# Hungary: e-vignette (e-matrica), tolls, road rules

Researched 2026-09-29 for Drum Bun. Scope: private passenger cars up to 3.5 t, cars towing a trailer or caravan, campers up to 3.5 t, and motorcycles, on the Romania to Austria corridors.

Source format: `[URL, language, page date]`. "No page date" means the page shows no date and the content was read on 2026-09-29.

Where the official sources are:
- The official seller and operator is Magyar Közút Nonprofit Zrt. – Útdíj Üzletág (it used to be NÚSZ Zrt.). Its site is nemzetiutdij.hu, which is also published as toll-charge.hu (EN) and maut-tarife.hu (DE). The official shop is ematrica.nemzetiutdij.hu.
- The legal basis is Decree 45/2020. (XI. 28.) ITM, amended by 34/2025. (XI. 30.) ÉKM and 38/2025. (XII. 22.) ÉKM.
  - The official legal database njt.hu (https://njt.hu/eli/R/2020/ITM/45) refused connections from this machine.
  - The decree text quoted below comes from the Wolters Kluwer copy at https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, which is in force from 2026-01-01 and includes 38/2025.

## Note for ingestion (for the agent's crawler)

nemzetiutdij.hu is a JavaScript single-page app. WebFetch and plain HTML scraping return only a logo. The same content is available as JSON through public GET endpoints, which is how the pages below were read:
- `https://nemzetiutdij.hu/cms/api/public/nemzetiutdij/contents/menuitem/publicroute/<route>`, for example `e-matrica-arak`, `e-vignette-rates`, `dijmentes-utszakaszok`, `toll-free-road-sections` or `preise-e-vignette`.
- `https://nemzetiutdij.hu/cms/api/public/nemzetiutdij/contents/slug/<slug>`, for news items and FAQ items. The FAQ slugs are the button ids on the FAQ page.
- Each record has `visibilityFrom` and `customInsDate`, which were used as page dates below.

---

## Facts

### 1. Vehicle categories: which applies to which vehicle

- The category is set by the registration document: field **J** (vehicle category), **F.1** (maximum authorised mass) and **S.1** (seats including the driver). [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date]
- **D1** is a passenger car of at most 3.5 t that carries at most 7 persons including the driver, together with the trailer it tows. J must show **M1 or M1G**. [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date] Legal definition: decree §8(1)a. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU, in force from 2026-01-01]
- **D1M** is a motorcycle. D1M prices exist only for the daily, 10-day and monthly national products. Motorcycles buy the annual national, county and M1 regional vignettes as **D1** products, at the car price. [https://nemzetiutdij.hu/api/uploads/e_matrica_arak_2026_pdf_611db0ecc1.pdf, HU, valid from 2026-01-01]
- **D2** is every other vehicle that is not an e-toll (HU-GO) vehicle. Any vehicle with **N1 or N1G** in field J is D2 regardless of seats, and so is any vehicle with 8 or more seats. [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date]
- **U** is a trailer towed by a **D2** vehicle, for example a trailer or caravan. There are two ways to buy it: [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date]
  - on the trailer's plate, which lets any D2 vehicle tow it, or
  - on the D2 towing vehicle's plate.
- **Car with trailer or caravan:** if the towing car is D1, the trailer or caravan needs **no separate vignette**. A U vignette is needed only if the towing vehicle is D2. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "Is a separate authorization required for trailers towed by passenger vehicles?"), EN, no page date]
- **Camper up to 3.5 t:**
  - It is **D1** if J = M1/M1G and S.1 is at most 7.
  - It is **D2** if it has more than 7 seats, or if J = N1/N1G.
  - It is also D2 if field J is empty and the document does not say "passenger vehicle" in the language of the country of origin.
  - German registration certificates may show "16" or "21" in place of M1/M1G.
  - [https://nemzetiutdij.hu/api/uploads/Lak%C3%B3aut%C3%B3k_2026_t%C3%A1j%C3%A9koztat%C3%B3_fin_EN_pdf_c6bd0fec9d.pdf, EN, 2026 guide] and [https://nemzetiutdij.hu/api/uploads/Lakoauto_tajekoztato_20260101_HUN_pdf_1719a8b5d9.pdf, HU, 2026-01-01]
- **Camper over 3.5 t (outside scope, but people will ask):**
  - From 2026-01-01 all motorhomes are in the e-vignette system, and a motorhome over 3.5 t needs **D2**. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "Can I use toll roads with a motorway vignette for my recreational vehicle exceeding … 3.5 tonnes?"), EN, visible from 2026-03-06]
  - In 2024 and 2025 these motorhomes had to use HU-GO distance-based e-toll instead. [https://nemzetiutdij.hu/api/uploads/Lak%C3%B3aut%C3%B3_t%C3%A1j%C3%A9koztat%C3%B3_2024_HU_pdf_70163358b2.pdf, HU, 2024]
- **A towed motor vehicle** (a car towing another car) needs its own vignette for its own category. A car carried on a trailer is not "towed". [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date]; decree §8(9) [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU, in force from 2026-01-01]
- **The B2 bus category was abolished.** Since 2024-02-01 no e-vignette can be bought in B2. [https://nemzetiutdij.hu/hu/hirek/e-matrica-arak-2024-januar-1-tol, HU, visible from 2024-01-01]

### 2. Products and exact validity

- The product names are unchanged. The 2026 official price list still says **"Heti (10 napos)"** in Hungarian and **"Weekly (10-day)"** in English. The word "weekly" was never replaced; the product has 10 days. [https://nemzetiutdij.hu/api/uploads/e_matrica_arak_2026_pdf_611db0ecc1.pdf, HU, valid from 2026-01-01]
- **National products:** daily, weekly (10-day), monthly and annual. **Territorial products:** annual county (vármegyei), and for 2026 also the discounted Borsod-Abaúj-Zemplén county vignette and the M1 regional vignette. [https://nemzetiutdij.hu/hu/e-matrica/dijak/e-matrica-arak, HU, no page date]
- **Daily** (in legal force from 2024-04-01):
  - It is valid from 0:00 to 24:00 on the calendar day the buyer chooses.
  - If it is bought on that same day, it is valid only from the moment of purchase, not retroactively.
  - Practical consequence: a night transit that crosses midnight is **not** covered by one daily vignette.
  - [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §3(2)a, §3(3), HU, in force from 2026-01-01]; [https://nemzetiutdij.hu/hu/hirek/aprilis-1-tol-lehet-napi-e-matricat-vasarolni, HU, 2024-03-28]
- **Weekly (10-day):** the start day the buyer chooses plus 9 further consecutive days, ending at 24:00 on the last day. That is 10 calendar days, and the start day counts as day 1. For example, start 2026-10-01 means valid until 2026-10-10 at 24:00. If it is bought on the start day, it runs from the moment of purchase. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §3(2)b, §3(3), HU]; [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date]
- **Monthly:** from the chosen start day until 24:00 on the same-numbered day of the following month. If that day does not exist, it ends at 24:00 on the last day of that month. For example, 15 Oct runs to 15 Nov 24:00, and 31 Jan runs to 28/29 Feb 24:00. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §3(2)c, HU, in force from 2026-01-01]
- **Annual national:** from purchase until 24:00 on **31 January of the following year**. If it is bought in the December pre-sale, it runs from 1 January.
  - The 2026 annual pre-sale started on 2025-12-08. December pre-sale has existed since 2016.
  - The year chosen on nemzetiutdij.hu **cannot be corrected afterwards**.
  - [https://nemzetiutdij.hu/hu/hirek/hetfotol-megvasarolhatoak-a-2026-os-eves-autopalya-matricak, HU, 2025-12-05]
- **Annual county (vármegyei):**
  - Valid on the tolled expressways of one county, from purchase (or from 1 January if pre-bought in December) until 24:00 on 31 January of the next year. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §3(4), HU]
  - Its coverage extends past the county border **up to the first junction in the next county**. [https://nemzetiutdij.hu/en/maps, EN, maps valid from 2026-01-01]
  - The exact junction limits are in Annex 1 of the decree (table in section 5 below).
- **Budapest has no separate county vignette.** The Pest county vignette also covers the tolled roads inside Budapest's administrative border. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §3(5), HU]
- **County vignettes can be bought by anyone, including foreigners.** There is no residence restriction, and one plate can hold any number of counties. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "Are regional e-vignettes available only for the county of the registered residence…?"), EN, no page date]
- **M1 regional (new for 2026):**
  - One annual product covering **all tolled expressways of Pest, Fejér, Komárom-Esztergom and Győr-Moson-Sopron**, not only the M1. Its territory equals the four county vignettes combined, so it also covers the M0, the M7 to Balatonvilágos and the M5 to Lajosmizse.
  - Anyone can buy it.
  - County vignettes already bought generally cannot be refunded if you later switch to the M1 regional.
  - [https://nemzetiutdij.hu/hu/hirek/tisztazzuk-a-felreerteseket-az-m1-regionalis-matrica-kapcsan, HU, 2026-01-22]; decree §22/A [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU]
- **Borsod-Abaúj-Zemplén county, 2026:** discounted to 2,500 HUF (D1/D1M/U) and 5,000 HUF (D2). This compensates for the M30 closure between Miskolc and Szikszó. [https://nemzetiutdij.hu/hu/hirek/valtozasok-az-e-matrica-rendszerben-2026-januar-1-tol, HU, 2025-12-02]; decree §22(10) [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU]
- **Price mechanics (decree §8(4) to §8(4b)):**
  - Prices are indexed each 1 January by the KSH **August** consumer price index of the previous year, rounded to 10 HUF.
  - The new price must be published on the operator's site **at least 30 days before it takes effect**.
  - The daily price is 9% of the annual national price (4.5% for D1M), rounded to 10 HUF and never above that percentage.
  - [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU, in force from 2026-01-01]
- **When next year's prices appear:**
  - 2025 prices were posted on 2024-09-10. [https://nemzetiutdij.hu/hu/hirek/e-matrica-arak-es-dijak-2025-01-01, HU, 2024-09-10]
  - 2026 prices became official with decree 34/2025 (XI. 30.) and were posted on 2025-12-02, because 2026 also brought new products. [https://nemzetiutdij.hu/hu/hirek/valtozasok-az-e-matrica-rendszerben-2026-januar-1-tol, HU, 2025-12-02]
  - For 2027, the transport ministry said prices would be announced in September after the KSH August CPI (1.3%). [https://www.penzcentrum.hu/auto/20260908/megszolalt-vitezy-miniszteriuma-eldolt-a-kedvezmenyes-palyamatricak-sorsa-erre-keszuljenek-az-autosok-2027-ben-1205142, HU, 2026-09-08, secondary]
  - As of 2026-09-29 I found **no official 2027 publication**; see Unverified.

### 3. Toll network and free sections

- **Rule:** with few exceptions, every road numbered M (motorway or expressway) is tolled for e-vignette vehicles. Main roads, such as the 42, the 4 and the 43, are free for cars. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "Exactly which sections are toll-free?"), EN, no page date]
- **Official toll-free sections** (the same list in HU and EN): [https://nemzetiutdij.hu/hu/e-matrica/dijak/dijmentes-utszakaszok, HU, no page date]; [https://nemzetiutdij.hu/en/e-vignette/tolls/toll-free-road-sections, EN, no page date]
  - M4 between Vecsés and Budapest Airport.
  - **M4 between Törökszentmiklós and Kisújszállás.**
  - M60 Pécs south-west bypass, between roads 58 and 5826.
  - All of the M8.
  - All of the M80.
  - M9 between main roads 6 and 51.
  - M9 bypass of Kaposvár (signed as road 61).
- The **Törökszentmiklós–Kisújszállás M4** section has been toll-free since **2025-12-22**. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "Which sections of the M4 expressway are tolled?"), EN, no page date]
  - It opened to traffic the same month. [https://magyarepitok.hu/utepites/2025/12/atadtak-az-m4-es-gyorsforgalmi-ut-elso-tiszantuli-szakaszat, HU, 2025-12, secondary]
- **The M6 has been tolled to the Croatian border (Ivándárda) since 2026-01-01.** Before that, the section beyond the M60 was free. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "Which expressway sections will be tolled from 1 January 2026?"), EN, visible from 2026-02-24]
- **Junction branches and collector/distributor roads are free; the main carriageway is tolled.** Examples: the M35 collector road at Debrecen (Kishegyesi út, road 33, road 354) and the M5 collector road leaving Budapest to the shopping centres. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "Is a toll charged also on the collector and distributor roads…?"), EN, no page date]
- **The M0 is tolled along its whole length**, from the M1-M0 junction to the M0/road 11 junction, and is covered by the Pest county vignette. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM Annex 1 row 29, HU]
- **The M5 is tolled up to the Röszke border.** "All e-vignette types" are sold at resellers at the border and nearby. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "Is Motorway M5 tolled up to the Röszke border checkpoint?"), EN, no page date]
- **The M4 now reaches the Romanian border at Nagykereki–Borș II**, joining the Romanian A3. The crossing and the A3 section Biharia–Borș opened in early September 2020. [https://www.ziuacargo.ro/articole/s-a-deschis-ptf-bors-ii-autostrada-a3-romania-conectata-la-m4-ungaria-176331.html/, RO, 2020-09-18, secondary]
  - Official confirmation that the M4 section from junction 211 to "Nagykereki, országhatár" is tolled: decree Annex 1 row 21. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU]
  - **There is no motorway between Kisújszállás and Berettyóújfalu**; the national e-vignette map, valid from 2026-01-01, shows a gap. [https://nemzetiutdij.hu/api/uploads/NUSZ_HD_terkep_20260101_ENG_jpg_cfb14a5f84.jpg, EN, valid from 2026-01-01]
  - The gap is to be built in 2029–2032. [https://www.haon.hu/helyi-gazdasag/2026/03/gyorsforgalmi-m4-epites-puspokladany-berettyoujfalu, HU, 2026-03, secondary]

### 4. Buying

- **Official channels:**
  - The operator's own shop **ematrica.nemzetiutdij.hu**, with no convenience fee. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "…official portal…"), EN, no page date]; [https://nemzetiutdij.hu/hu/hirek/aprilis-1-tol-lehet-napi-e-matricat-vasarolni, HU, 2024-03-28]
  - The operator's customer service offices, listed below.
  - The state-owned **Nemzeti Mobilfizetési Zrt.** (NMFR) and its contracted resellers: apps, SMS, web, fuel stations and shops near border crossings. [https://nemzetiutdij.hu/en/e-vignette/additional-information/online-and-mobile-purchase, EN, no page date]
  - The legal basis is decree §3(6) and §4(1): only the operator and resellers with a contract may sell. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU]
- **Many third-party sites call themselves "official".** Examples are hungary-vignette.eu, e-autopalyamatrica.hu and autovignet.hu. They are NMFR resellers, not the operator.
  - The operator says it is not liable for reseller errors, and problems must be raised with the reseller. [https://nemzetiutdij.hu/en/e-vignette/additional-information/online-and-mobile-purchase, EN, no page date]
  - One example: ro.autovignet.hu describes itself as an "official reseller partner of National Mobile Payments Plc." [https://ro.autovignet.hu/preturi/, RO, © 2026]
- **Customer service offices** are all inland, on weekday office hours, and none is at a border crossing:
  - Budapest (three offices, one at the Szilas rest area)
  - Debrecen, Miskolc, Mosonmagyaróvár, Pécs, Szeged, Székesfehérvár and Szolnok
  - [https://nemzetiutdij.hu/en/customer-service, EN, retrieved 2026-09-29 via `/cms/api/hugoCustomerService/public/nemzetiutdij/customer-services?lang=en`]
- **Data recorded at purchase:** plate, **country code (felségjel)**, category, and the validity start and end. The buyer must check and approve them. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §4(2)–(3), HU]
- **What enforcement checks:** plate + country code + category. A wrong country code is treated like having no vignette. [https://nemzetiutdij.hu/en/e-vignette/surcharges/surcharge-differential-surcharge, EN, no page date]
- **Plate format:**
  - Enter the plate **without spaces**.
  - Enter accented letters as the plain English letter, for example Ü as U.
  - [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "…registration number contains accented letters?"), EN, visible from 2025-06-23]
- **Online shop without registration:** you choose the country code, plate and category, and the plate is re-entered in a pop-up to confirm. With registration, the shop warns about overlapping vignettes. [https://nemzetiutdij.hu/api/uploads/e_vignette_gtc_user_2026_01_01_pdf_69a04b3393.pdf §5.1–5.2, EN, effective 2026-01-01]
- **When the vignette becomes valid:**
  - Daily, 10-day and monthly vignettes are valid from the moment payment completes, **unless a start date is chosen**. With a future start date they run from 0:00 of that day.
  - An annual or county vignette bought during the year is valid from the minute of purchase.
  - [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date]
- **Proof of purchase:**
  - The right is valid only once you have received the confirmation message (online) or the signed counterfoil (at a shop). [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §7(1), HU]
  - Keep the counterfoil or confirmation for **3 years from the last day of validity**. [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date]
  - If you bought through a registered account on ematrica.nemzetiutdij.hu, you do not need to keep it. [https://nemzetiutdij.hu/hu/hirek/hetfotol-megvasarolhatoak-a-2026-os-eves-autopalya-matricak, HU, 2025-12-05]
- **Buy before entering; there is a 60-minute exception:**
  - You must hold the vignette before driving onto a tolled section.
  - Bona fide drivers who entered **by mistake** have 60 minutes to buy. The English page counts the 60 minutes "from the entry". The Hungarian enforcement page counts them "az ellenőrzéstől számítva" (from the check), which is closer to the decree wording.
  - [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN, no page date]; [https://nemzetiutdij.hu/hu/e-matrica/egyeb-informaciok/dijellenorzes, HU, no page date]
  - The legal rule is decree §11(3): no surcharge for a check made within the 60 minutes **before** the start of validity of a properly bought vignette. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU]
  - Safe advice for the agent: buy before the border, or at the latest within 60 minutes of entering.
- **Limits on the 60-minute rule:**
  - If a mobile patrol stops you, you may buy on the spot within the 60 minutes. If you refuse, you **lose** the 60-minute option. [https://nemzetiutdij.hu/en/e-vignette/surcharges/surcharge-differential-surcharge, EN, no page date]; decree §10(2) [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU]
  - A vignette bought more than 60 minutes ago cannot be refunded. [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions (item "When do I have to buy an e-vignette?"), EN, no page date]
  - Points of sale located **on** toll sections, such as rest-area fuel stations, are meant for buying for later trips, not the current one. Mobile checks can take place there. [https://nemzetiutdij.hu/hu/e-matrica/egyeb-informaciok/dijellenorzes, HU, no page date]
- **Fixing a mistake before you drive:**
  - Before the validity starts, any vignette can be bought back free of charge (in person). [https://nemzetiutdij.hu/en/e-vignette/services-available-at-customer-service-offices/e-vignette-services, EN, no page date]
  - Daily, 10-day and county vignettes cannot be bought back after their validity starts. [same page]

### 5. Corrections: wrong plate, wrong country code, wrong category

The rules below are all from [https://nemzetiutdij.hu/en/e-vignette/services-available-at-customer-service-offices/e-vignette-services, EN, no page date].

- **Wrong plate:**
  - If no surcharge has been imposed, the plate can be corrected at any time during validity.
  - If a surcharge has been imposed, the plate can be corrected **within 60 days of receiving the surcharge notice**, and only if **no more than 3 characters** are wrong (wrong order counts).
  - After correction, the vignette is valid for the corrected plate from its first day.
- **Wrong country code:** the same 60-day rule after a surcharge notice applies; otherwise it can be corrected any time during validity.
- **Correction fee:**
  - HUF **1,470** per application.
  - Free for confusing 0/O or 1/I, and for "OE" typed instead of Ö or "UE" instead of Ü.
- **Where to request a plate or country-code correction:**
  - a video channel (Hungarian only), in person at a customer service office, or through mobile inspectors
  - by e-mail or post once the vignette has expired
- **Wrong category:**
  - Can be re-registered within the validity period. You pay the price difference (or receive it back) plus HUF 1,470.
  - Correcting the category does not cancel a surcharge that was already imposed.
- **Transfer after selling the car:**
  - Monthly and annual vignettes can be moved to another vehicle of the same category.
  - Daily and 10-day vignettes can be moved only before their validity starts.
  - A county vignette can be moved only within the same county.
  - The fee is HUF 1,470.
- **Payment at customer service offices:** cash in HUF or EUR (change given in HUF; 200 EUR is the largest note accepted), or card.

### 6. Surcharges (pótdíj) and enforcement

- **Amounts for all categories (tied to the D1 annual national price):**

  | | From 2026-01-01 | 2025 |
  |---|---|---|
  | Base surcharge, paid **within 60 days** | HUF **27,790** | HUF 26,640 |
  | Increased surcharge, paid **after 60 days** | HUF **95,730** | HUF 91,780 |
  | Differential surcharge (vignette in a cheaper category), base | HUF 15,530 | HUF 14,900 |
  | Differential surcharge, increased | HUF 49,190 | HUF 47,180 |

  [https://nemzetiutdij.hu/api/uploads/e_matrica_arak_2026_pdf_611db0ecc1.pdf, HU, valid from 2026-01-01]; [https://nemzetiutdij.hu/hu/hirek/e-matrica-arak-es-dijak-2025-01-01, HU, 2024-09-10]
- **Legal formula:**
  - Base surcharge = 45% of the D1 annual national price; increased surcharge = 155% of it.
  - The 60 days run from when the surcharge becomes due: on the spot, or on delivery of the notice.
  - [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §12(4)–(6), HU]
  - For electronic (camera) detection, the 60 days run from receipt of the payment notice, and customer service cannot extend them. [https://nemzetiutdij.hu/en/e-vignette/surcharges/surcharge-differential-surcharge, EN, no page date]
- **At most one surcharge per plate per calendar day.** If one trip crosses midnight and at most 60 minutes pass between the first and the last detection, only one surcharge applies. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §11(4), HU]
- **Relief options, which must be requested:** [https://nemzetiutdij.hu/en/e-vignette/surcharges/surcharge-discounts, EN, no page date]
  - **Maximization:** if you get several notices, you pay at most 2 base surcharges, if you apply within **75 days** of the first notice.
  - **Amnesty:** 6 base surcharges cover all cases detected in the 180 days before the application.
  - **Buying an annual national vignette** within **75 days** of the notice cancels unpaid surcharges of the current year. The vignette must be newly bought, and it cannot be transferred or refunded later.
- **How checks are done:**
  - Fixed cameras, mobile camera units and mobile stop-checks. [https://nemzetiutdij.hu/hu/e-matrica/egyeb-informaciok/dijellenorzes, HU, no page date]
  - Checks can happen anywhere on the tolled network, including rest areas and junction ramps. [same page]; decree §10(3) [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU]
- **Foreign plates:**
  - The operator has no direct access to foreign vehicle registers "due to a lack of agreements". It uses collection partners that do have access, and those partners may add their own costs under local law. [https://nemzetiutdij.hu/en/e-vignette/surcharges/surcharge-collection-procedure-applicable-to-vehicles-with-foreign-country-codes, EN, no page date]
  - Once a case has passed to a partner, **all** handling (payment, corrections, discounts) goes through that partner. [same page]
  - The decree itself allows automated searches in the vehicle registers of other EU states. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §11(5)b, HU]
- **Collection partners:** [https://nemzetiutdij.hu/en/e-vignette/additional-information/collection-agencies, EN, no page date]
  - **For Romanian plates:** SOLVENTIS, with Romanian customer service at UAI Inkasso S.R.L., str. Olteniei 67, 410059 Oradea, tel. +40-37-64-48-061.
  - **For German plates (and others):** UAI Solutions GmbH, Schellenbruckplatz 49, D-84307 Eggenfelden, tel. +49-8721-506-970.
  - Also Euro Parking Collection Plc (UK) and Petkov & Co (Slovakia).
- **Paying by bank transfer:** to Magyar Közút Nonprofit Zrt., IBAN HU58 1040 2142 4955 5557 5754 1179, SWIFT OKHBHUHB. The reference must include "Pótdíj" and the notice number. [https://nemzetiutdij.hu/en/e-vignette/surcharges/surcharge-differential-surcharge, EN, no page date]
- **Beware of phishing:** the operator never contacts customers by phone or SMS, only by letter or by e-mail from @nemzetiutdij.hu addresses. [https://nemzetiutdij.hu/en/e-vignette/additional-information/online-and-mobile-purchase, EN, no page date]

### 7. Winter rules and must-know road rules

- **Winter tyres:** there is **no** general winter-tyre obligation in Hungary. The road operator can put up "Hólánc használata kötelező" (snow chains mandatory) signs. [https://www.katasztrofavedelem.hu/382/katasztrofatipusok-teli-veszelyek-a-teli-gumi-es-holanc-kotelezo-hasznalata-a-szomszedos-orszagokban, HU, no page date (official disaster-management agency)]
- **Snow chains (KRESZ):**
  - Under the chains sign, at least one **driven axle** must have chains fitted. [KRESZ §13(1)k, https://net.jogtar.hu/jogszabaly?docid=97500001.KPM, HU, in force from 2026-04-11]
  - **If the sign is placed at a border crossing, only vehicles carrying chains may enter Hungary.** [KRESZ §13(1)k/2, same source]
  - Chains may be used only on snowy or icy roads (§48(2)), with a maximum speed of 50 km/h (§26(1)d/1). [same source]
- **Studded tyres** are banned on public roads. [https://www.katasztrofavedelem.hu/382/katasztrofatipusok-teli-veszelyek-a-teli-gumi-es-holanc-kotelezo-hasznalata-a-szomszedos-orszagokban, HU, no page date]
- **Lights:**
  - Outside built-up areas, cars must use daytime running lights **or** dipped headlights, day and night. [KRESZ §44(8), https://net.jogtar.hu/jogszabaly?docid=97500001.KPM, HU, in force from 2026-04-11]
  - Motorcycles must use **dipped headlights at all times**, including by day and in towns. [KRESZ §44(7), same source]
- **Alcohol:** zero tolerance. No alcohol from drinking may be present in the driver's body. [KRESZ §4(1)c, same source]; also shown as 0.0 for all drivers on [https://europa.eu/youreurope/citizens/travel/driving-abroad/road-rules-and-safety/hungary/index_en.htm, EN, last checked 2024-09-18]
- **Speed limits for cars, motorcycles and vehicles up to 3.5 t:** motorway 130, expressway (autóút) 110, other roads outside built-up areas 90, built-up areas 50 km/h. [KRESZ §26(1)a, https://net.jogtar.hu/jogszabaly?docid=97500001.KPM, HU]
- **Speed limits for a car towing a trailer or caravan:** motorway **80**, other roads outside built-up areas **70**, built-up areas 50 km/h. [KRESZ §26(1)b, same source]
- **Reflective vest:** anyone standing on the carriageway, hard shoulder or verge outside built-up areas at night or in poor visibility must wear one. [KRESZ §21(12), same source]
- **Warning triangle:** a broken-down car on the carriageway or hard shoulder outside built-up areas must be marked with a triangle (two-wheel motorcycles excepted). [KRESZ §56(6), same source]
- **Phone:** no handheld phone use while driving. [KRESZ §3(2), same source]
- **"Megye" replaces "vármegye":**
  - Act XLIX of 2026 changes the term "vármegye/vármegyei" (county) back to "megye/megyei" across the law. It was published in Magyar Közlöny 2026/131 on 2026-09-11, and most provisions take effect on **2026-10-01**. [https://magyarkozlony.hu/hivatalos-lapok/QvrmPQ44VAr6lX2BTeEz6aa058bf72cf3/dokumentumok/d5a9c2f2c728908437c52693273af4a34e30c7cb/letoltes, HU, 2026-09-11]
  - The agent should treat "vármegyei matrica" and "megyei matrica" as the same product.

---

## Prices

Category D1 unless noted. All prices are gross HUF including VAT. Sources:
- **2026:** [https://nemzetiutdij.hu/api/uploads/e_matrica_arak_2026_pdf_611db0ecc1.pdf, HU, valid from 2026-01-01, e-signed]. Mirrored at [https://nemzetiutdij.hu/hu/e-matrica/dijak/e-matrica-arak, HU], [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates, EN] and [https://maut-tarife.hu/de/e-vignette-de/maut/preise-e-vignette, DE].
- **2025:** [https://nemzetiutdij.hu/hu/hirek/e-matrica-arak-es-dijak-2025-01-01, HU, 2024-09-10].
- **Validity rules:** decree §3 [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU].

| Product | Category | 2025 | 2026 | Validity rule | Source |
|---|---|---|---|---|---|
| Daily (napi) | D1 (car, car + trailer, camper ≤3.5 t M1 ≤7 seats) | 5,320 | **5,550** | Chosen calendar day 0–24 h; same-day purchase from the moment of payment | 2026 PDF; 2025 news |
| Daily | D1M (motorcycle) | 2,660 | **2,770** | as above | same |
| Daily | D2 | 7,560 | **7,890** | as above | same |
| Daily | U (trailer of a D2 vehicle) | 5,320 | **5,550** | as above | same |
| Weekly (10-day) | D1 | 6,620 | **6,900** | Start day + 9 more days, until 24:00 of the 10th calendar day | same |
| Weekly (10-day) | D1M | 3,310 | **3,450** | as above | same |
| Weekly (10-day) | D2 | 9,630 | **10,040** | as above | same |
| Weekly (10-day) | U | 6,620 | **6,900** | as above | same |
| Monthly | D1 | 10,710 | **11,170** | Start day until 24:00 of the same-numbered day next month (or the month's last day) | same |
| Monthly | D1M | 5,360 | **5,590** | as above | same |
| Monthly | D2 | 15,170 | **15,820** | as above | same |
| Monthly | U | 10,710 | **11,170** | as above | same |
| Annual national | D1 (also motorcycles) | 59,210 | **61,760** | Purchase (or 1 Jan with December pre-sale) until 24:00 on 31 Jan of the next year | same |
| Annual national | D2 | 84,040 | **87,650** | as above | same |
| Annual national | U | 59,210 | **61,760** | as above | same |
| Annual county, per county | D1 (also motorcycles) | 6,890 | **7,190** | One county, up to the first junction in the next county; purchase until 24:00 on 31 Jan of the next year | same |
| Annual county | D2 | 13,780 | **14,370** | as above | same |
| Annual county | U | 6,890 | **7,190** | as above | same |
| Borsod-Abaúj-Zemplén county, discounted (2026 only) | D1/D1M/U | 6,890 (normal county price) | **2,500** | As a county vignette | 2026 PDF; decree §22(10) |
| Borsod-Abaúj-Zemplén county, discounted | D2 | 13,780 | **5,000** | as above | same |
| M1 regional (new in 2026) | D1/D1M/U | did not exist | **15,000** | Annual; the whole tolled network of Pest, Fejér, Komárom-Esztergom and Győr-Moson-Sopron | 2026 PDF; decree §22/A |
| M1 regional | D2 | did not exist | **30,000** | as above | same |
| Base / increased surcharge | all | 26,640 / 91,780 | **27,790 / 95,730** | Within / after 60 days | same |
| Base / increased differential surcharge | all | 14,900 / 47,180 | **15,530 / 49,190** | Within / after 60 days | same |

Earlier years, for spotting stale pages:
- **2024 D1:** daily 5,150 (from 2024-04-01), 10-day 6,400, monthly 10,360, annual 57,260, county 6,660. [https://nemzetiutdij.hu/hu/hirek/aprilis-1-tol-lehet-napi-e-matricat-vasarolni, HU, 2024-03-28]
- **B2** existed until 2024-01-31. [https://nemzetiutdij.hu/hu/hirek/e-matrica-arak-2024-januar-1-tol, HU]

Price comparisons for the agent (my arithmetic from the 2026 official prices, D1):
- **A single one-day transit:** a daily vignette (5,550) beats a 10-day (6,900). A transit that crosses midnight needs a 10-day vignette or two dailies (11,100).
- **Outbound and return 11–31 days apart, each done within one calendar day:** two dailies (11,100) are 70 HUF cheaper than one monthly (11,170). Two 10-day vignettes cost 13,800.
- **The national annual (61,760)** pays off from the 9th separate 10-day period in a year (8 × 6,900 = 55,200; 9 × 6,900 = 62,100).

---

## Corridors

Junction numbers and chainages come from Annex 1 of decree 45/2020 (county-vignette coverage). [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM, HU, in force from 2026-01-01]

They were cross-checked against the official 2026 maps:
- national: [https://nemzetiutdij.hu/api/uploads/NUSZ_HD_terkep_20260101_ENG_jpg_cfb14a5f84.jpg, EN, valid from 2026-01-01]
- county maps listed at [https://nemzetiutdij.hu/en/maps, EN]
- M1 regional: [https://nemzetiutdij.hu/api/uploads/HD_M1_regionalis_EN_jpg_c7412eb21f.jpg, EN, valid from 2026-01-01]

| Corridor | Section | Road | County (county vignette that covers it) | Toll |
|---|---|---|---|---|
| a | Nădlac II ↔ Csanádpalota border → Szeged-észak (M5) | M43 | Csongrád-Csanád (all of the M43) | Yes |
| a | Old crossing Nădlac ↔ Nagylak (road 43), joining the M43 at junction 55 Nagylak | main road 43, then M43 | Csongrád-Csanád | Road 43: no. M43: yes |
| a | Szeged → junction 114 Kiskunfélegyháza-dél | M5 | Csongrád-Csanád (from 114 to the Röszke border) | Yes |
| a | 114 → 53 Örkény (Kecskemét, Lajosmizse) | M5 | Bács-Kiskun (53 Örkény – 140 Kistelek) | Yes |
| a | 67 Lajosmizse → 13 Budapest Szentlőrinci út | M5 | Pest (13–67) | Yes |
| a | M5 → M1 around Budapest | M0 | Pest (all of the M0) | Yes |
| a | Budapest city limit (km 7.68) → 39 Bicske | M1 | Pest (city limit – 39) | Yes |
| a | 27 Herceghalom → 56 Tatabánya-Óváros (the **39–48 stretch is covered only by Fejér**) | M1 | Fejér (27–56) | Yes |
| a | 48 Szárliget → 112 Győr-Ipari Park | M1 | Komárom-Esztergom (48–112) | Yes |
| a | 94 Bábolna → Hegyeshalom border (km 171), to A4 Nickelsdorf | M1 | Győr-Moson-Sopron (94 – border) | Yes |
| b | Borș II ↔ Nagykereki border → junction 211 M4-M35 (Berettyóújfalu) | M4 | Hajdú-Bihar (211 – Nagykereki border) | Yes, from the border line |
| b | Borș (I) ↔ Ártánd → Biharkeresztes → Berettyóújfalu → Püspökladány | main road 42 | Hajdú-Bihar | No |
| b | Püspökladány → Karcag → Kisújszállás (M4 gap; motorway planned for 2029–2032) | main road 4 | Hajdú-Bihar / Jász-Nagykun-Szolnok | No |
| b | Kisújszállás → 118 Törökszentmiklós-nyugat | M4 | Jász-Nagykun-Szolnok | **No** (free since 2025-12-22) |
| b | 118 → 94 Abony-kelet | M4 | Jász-Nagykun-Szolnok (94–118) | Yes |
| b | 99 Szolnok-észak → 21 Airport junction → M0 | M4 | Pest (21–99) | Yes |
| b | Vecsés ↔ Budapest Airport spur | M4 | Pest | No |
| b (via Debrecen) | 211/67 M35-M4 → Debrecen → 187 M3-M35 | M35 | Hajdú-Bihar (all of the M35) | Yes; the Debrecen collector road is free |
| b (via Debrecen) | 187 → 164 Hejőkürt | M3 | Hajdú-Bihar (164–221) | Yes |
| b (via Debrecen) | 175 Polgár → 114 Füzesabony | M3 | Borsod-Abaúj-Zemplén (114–175) | Yes |
| b (via Debrecen) | 128 Mezőkövesd → 39 Bag | M3 | Heves (39–128) | Yes |
| b (via Debrecen) | 55 Hatvan → 11 Budapest Szentmihályi út | M3 | Pest (11–55) | Yes |
| c | Budapest → Győr → Hegyeshalom | M1 | Pest, Fejér, Komárom-Esztergom, Győr-Moson-Sopron (as in route a) | Yes |
| c | Győr-nyugat → Csorna → Sopron, junction 94 "Sopron, országhatár" | M85 | Győr-Moson-Sopron (all of it) | Yes |
| c | Csorna-észak → 116 Répcelak | M86 | Győr-Moson-Sopron (116 – Csorna-észak) | Yes |
| c | 124 Beled → 81 Szombathely | M86 | Vas (81–124) | Yes |
| c | M1 → Rajka border (to Bratislava) | M15 | Győr-Moson-Sopron | Yes |

### Annual cost of covering a corridor with county vignettes (2026, D1)

My arithmetic from the official prices, using the county limits above.

| Route | Counties needed | Counties only | With the M1 regional replacing Pest + Fejér + Komárom-Esztergom + Győr-Moson-Sopron | National annual |
|---|---|---|---|---|
| (a) Nădlac II → M43 → M5 → M0 → M1 → Hegyeshalom | Csongrád-Csanád, Bács-Kiskun, Pest, Fejér, Komárom-Esztergom, Győr-Moson-Sopron (6) | 6 × 7,190 = **43,140** | 2 × 7,190 + 15,000 = **29,380** | 61,760 |
| (b1) Borș II → M4 → M35 → M3 → M0 → M1 | Hajdú-Bihar, Borsod-Abaúj-Zemplén, Heves, Pest, Fejér, Komárom-Esztergom, Győr-Moson-Sopron (7) | 6 × 7,190 + 2,500 (discounted Borsod) = **45,640** | 7,190 + 2,500 + 7,190 + 15,000 = **31,880** | 61,760 |
| (b2) Ártánd → road 42 → road 4 → Kisújszállás → M4 → M0 → M1 | Jász-Nagykun-Szolnok, Pest, Fejér, Komárom-Esztergom, Győr-Moson-Sopron (5) | 5 × 7,190 = **35,950** | 7,190 + 15,000 = **22,190** | 61,760 |
| (b3) Borș II → M4 → exit 215 Berettyóújfalu → roads 42/4 → M4 | Hajdú-Bihar + the (b2) set (6) | **43,140** | 2 × 7,190 + 15,000 = **29,380** | 61,760 |
| (a) and (b2) in the same year | Csongrád-Csanád, Bács-Kiskun, Jász-Nagykun-Szolnok + the 4 M1 counties | 7 × 7,190 = 50,330 | 3 × 7,190 + 15,000 = **36,570** | 61,760 |
| (c) Budapest → M1/M85 → Austria | Pest, Fejér, Komárom-Esztergom, Győr-Moson-Sopron | 28,760 | **15,000** | 61,760 |

Conclusion:
- For an annual user on one corridor, county vignettes, and in 2026 especially the county + M1 regional combination, are much cheaper than the national annual.
- Route (a) with the M1 regional costs 29,380, which equals about 4.3 ten-day vignettes. From the 5th separate 10-day period in a year it is cheaper than buying 10-day vignettes.
- Pitfalls for the agent:
  - The Fejér-only stretch on the M1 between 39 Bicske and 48 Szárliget: Pest + Komárom-Esztergom + Győr-Moson-Sopron does **not** cover the M1.
  - A county vignette covers only up to the first junction past the county border.
  - The discounted Borsod-Abaúj-Zemplén vignette and the M1 regional are 2026 products.

---

## Outdated claims

These are low-trust pages that contradict the current rules, meant to be added so the knowledge base surfaces contradictions. Quotes are kept short.

| # | URL | Short quote | Page date | What is current instead (with source) |
|---|---|---|---|---|
| 1 | https://index.hu/gazdasag/2026/09/08/autopalya-matrica-potdij-inflacio-dragulas-kozlekedes/ (HU, major news site) | "Alap pótdíj (fizetés 75 napon belül): 28 150 Ft" | 2026-09-08 | The base surcharge applies to payment **within 60 days**; 75 days is the deadline for maximization and annual-vignette relief requests (decree §12(4), §14(1)). The 28,150 figure is a calculated projection; the official 2026 base surcharge is 27,790. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM] |
| 2 | https://www.vg.hu/vilaggazdasag-magyar-gazdasag/2026/09/autopalya-matrica-dragulas-aremeles-2027-magyarorszag (HU) | Headline "Hivatalos: ennyivel drágul 2027 januárjától…" ("Official: this is how much it rises from January 2027"); D1 daily "5 622" | 2026-09-08 | Not official. The body itself says the prices become official only when the regulation is published. The decree rounds to 10 HUF, and the daily price is at most 9% of the annual, so the unrounded figures cannot be final. As of 2026-09-29 the 2026 prices still apply. |
| 3 | https://www.autozeitung.de/vignette-ungarn-202979.html (DE) | Toll-free list includes "M6 zwischen M60 Autobahn und kroatischer Grenze" (the M6 between the M60 and the Croatian border); D1 prices "5320 Ft", "6620 Ft", "59.210 Ft" | published 2025-12-29, modified 2026-01-20 | The M6 has been tolled to the Ivándárda border since 2026-01-01. The 2026 D1 prices are 5,550 / 6,900 / 61,760. The list also misses the free M4 Törökszentmiklós–Kisújszállás section (since 2025-12-22). [https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions] |
| 4 | https://www.carwow.de/automagazin/verkehrsregeln/fahren-im-ausland/maut-ungarn (DE) | "Wohnmobil (bis zu 3,5 Tonnen zGG) … Kategorie D2"; over 3.5 t: HU-GO, "Du brauchst keine Vignette mehr" ("you no longer need a vignette") | published 2024-05-08, modified 2024-06-12 | A camper up to 3.5 t with M1 and at most 7 seats is **D1**. Since 2026-01-01 motorhomes over 3.5 t need a **D2 e-vignette**, not HU-GO. [https://nemzetiutdij.hu/api/uploads/Lak%C3%B3aut%C3%B3k_2026_t%C3%A1j%C3%A9koztat%C3%B3_fin_EN_pdf_c6bd0fec9d.pdf] |
| 5 | https://www.clearedforcamping.de/ratgeber/maut-europa-wohnmobil (DE) | "Seit Januar 2024 fallen alle Wohnmobile — unabhängig vom Gewicht — in das E-Matrica-System" ("since January 2024 all motorhomes, whatever their weight, are in the e-matrica system") | published 2026-04-05, modified 2026-08-05 | Wrong year. That has applied since **2026-01-01**; in 2024–2025 motorhomes over 3.5 t used HU-GO. [https://nemzetiutdij.hu/api/uploads/Lak%C3%B3aut%C3%B3_t%C3%A1j%C3%A9koztat%C3%B3_2024_HU_pdf_70163358b2.pdf] |
| 6 | https://www.verivox.de/kfz-versicherung/themen/vignette-ungarn/ (DE) | "10-Tages-Vignette: 3.820 HUF", "Jahresvignette: 46.850 HUF", and a "B2: Busse" category | 2024-06-30 | The 2026 D1 prices are 10-day 6,900 and annual 61,760. The B2 category was abolished on 2024-02-01. There is no daily vignette in its list, although one exists since 2024-04-01. [https://nemzetiutdij.hu/hu/hirek/e-matrica-arak-2024-januar-1-tol] |
| 7 | https://www.roviniete.ro/ro/info/hu-vignette-unde-cumperi-ce-trebuie-sa-stii (RO, reseller) | "vignetta de 10 zile, lunar și anuale" ("10-day, monthly and annual vignettes"); "Categoria tarifara B2 : autobuze" ("fee category B2: buses") | no date (footer © 2026) | Daily vignettes exist since 2024-04-01, and there are county and M1 regional products. B2 has been abolished. [https://nemzetiutdij.hu/hu/hirek/aprilis-1-tol-lehet-napi-e-matricat-vasarolni] |
| 8 | https://www.oeamtc.at/laenderinfo/ungarn/maut-vignette-in-ungarn-81973170 (DE, travel club) | "Der Kaufbeleg … ist aus Beweisgründen 2 Jahre aufzubewahren" ("keep the receipt for 2 years as evidence") | no date shown | The operator says to keep it for **3 years** from the last day of validity. [https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates] |
| 9 | https://www.hungary-vignette.eu/en/vignette-info (EN, reseller that calls itself "Official") | 10-day valid "until 00:00 of the 10th day"; annual "until 00:00 January 31" | no date | The decree says **until 24:00** of the 10th day, and until **24:00 on 31 January**. [https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM §3(2)] |
| 10 (flag for the Romania file) | https://www.katasztrofavedelem.hu/382/katasztrofatipusok-teli-veszelyek-a-teli-gumi-es-holanc-kotelezo-hasznalata-a-szomszedos-orszagokban (HU, official Hungarian agency) | "Romániában 2011-től november 1. és március 31. között kötelező a téli gumik használata" ("in Romania winter tyres have been mandatory from 1 November to 31 March since 2011") | no date | This is a claim about **Romania**, not Hungary; I did not verify it. It should be checked against the Romanian research, since Romanian rules are commonly described as depending on road conditions. The same page's statements about Hungary (no winter-tyre obligation, chain sign, studded tyres banned) agree with KRESZ. |

Corrections to assumptions in the brief:
- **"You can buy within 60 minutes after entering" is not outdated.** It is still on the official site for drivers who entered by mistake in good faith, and decree §11(3) is in force. The limits are in section 4.
- **"County vignettes cannot be used by foreigners" is false.** Anyone can buy any county.
- **"Heti" was not renamed** and was never 7 days.

---

## Unverified

These are not confirmed by an official page in this session, so they must not be presented as fact.

1. **2027 prices.** No official publication was found as of 2026-09-29.
   - Media calculations with the August 2026 CPI of 1.3%: D1 annual national 62,560; county 7,280; D1 daily about 5,630 (9% rule); 10-day about 6,990; monthly about 11,320; base / increased surcharge about 28,150 / 96,970. Sources: [https://index.hu/gazdasag/2026/09/08/autopalya-matrica-potdij-inflacio-dragulas-kozlekedes/, HU, 2026-09-08] and [https://www.portfolio.hu/gazdasag/20260908/itt-vannak-a-2027-es-e-matricak-arai-858180, HU, 2026-09-08].
   - By decree the price must be published at least 30 days before 2027-01-01.
2. **The M1 regional in 2027.** The ministry said it plans no change to the rules (secondary source: Pénzcentrum, 2026-09-08). Whether the 15,000 price is indexed, and whether the discounted Borsod-Abaúj-Zemplén county vignette continues in 2027, is unknown.
3. **Renaming on the vignette itself.** Whether nemzetiutdij.hu and the shop will relabel "vármegyei matrica" as "megyei matrica" from 2026-10-01 is not confirmed. The law changes the term, but the 45/2020 decree is a ministerial decree and needs its own amendment.
4. **How far in advance** daily, 10-day and monthly vignettes can be pre-bought (not stated on the pages read).
5. **Exact entry of foreign plates with hyphens, E-plates or seasonal plates** (Germany/Austria), and the exact country-code picker label for Germany ("D"?). The official rule seen is only: no spaces, and accented letters as plain letters.
6. **Convenience fees** charged by NMFR resellers and apps (some reseller sites say "no fee"; I did not check reseller by reseller). Only ematrica.nemzetiutdij.hu is documented as fee-free.
7. **Which vignette types are sold at the Csanádpalota/Nădlac II, Ártánd and Nagykereki crossings.** The official statement about border sales was found only for Röszke on the M5.
8. **Whether the M85 at junction 94 "Sopron, országhatár" links directly to Austria's S31 at Klingenbach.** The map shows the Sopron–Klingenbach crossing next to it; not confirmed.
9. **Mandatory equipment to carry in a foreign-registered car** (first-aid kit, reflective vest, triangle). KRESZ sets duties to use a triangle and wear a vest; the obligation to carry these items in foreign cars was not confirmed from an official Hungarian source. The EU "Your Europe" page lists only a warning triangle. [https://europa.eu/youreurope/citizens/travel/driving-abroad/road-rules-and-safety/hungary/index_en.htm, EN, last checked 2024-09-18]
10. **Emission zones.** No permanent low-emission zone for passenger cars was found on official sources. Budapest has smog-alert driving bans by Hungarian environmental class codes (city ordinance 69/2008 (XII. 10.) Főv. Kgy., per secondary sources). Whether and how they apply to foreign-registered cars is not confirmed.
11. **Whether Hungary gets RO/DE owner data through the EU cross-border exchange (Directive 2019/520)** for e-vignette surcharges in practice. The decree allows automated EU register searches (§11(5)b), but the operator's page says it relies on collection partners because it lacks agreements.
12. **Timing of the M4 Kisújszállás–Berettyóújfalu completion (2029–2032).** Only regional news sources, not an official project page.

## Update 1 Oct 2026

- All 2026 D1/D1M prices rechecked against the official 2026 price list and decree 45/2020 (XI. 28.) ITM (net.jogtar.hu, version in force from 1 Jan 2026): unchanged.
- The M1 regional vignette has no end date: §22/A(4) only says it can be bought "első alkalommal a 2026. évre". Only the Borsod-Abaúj-Zemplén discount is limited to 2026.
- 2027 prices: still not published by the operator on 1 Oct 2026 (press figures from 8 Sep 2026 are CPI estimates). §8(4) requires publication at least 30 days before 1 Jan 2027.
- "Less than half the national annual vignette" (half of 61,760 = 30,880 HUF) holds for the Nădlac route (Csongrád-Csanád + Bács-Kiskun + M1 regional = 29,380) and the Ártánd route (22,190), not for a route over the M3 (31,880).
- Decree 45/2020 Annex 1: the Pest vignette covers the M1 from km 7+680 to 38+625, Komárom-Esztergom from 47+975, Fejér 26+112 to 56+0, so about 9.35 km (Bicske–Szárliget) is covered only by Fejér.
- Border traffic for the post: Romanian Border Police, 3 Jan 2020: from 20 Dec 2019 to 3 Jan 2020 about 941,000 people crossed at the western border crossing points, over 361,000 at Nădlac II. [https://www.politiadefrontiera.ro/ro/main/i-peste-25-milioane-de-persoane-au-tranzitat-frontiera-in-perioada-sarbatorilor-de-iarna-19003.html, RO, 3 Jan 2020] No counts exist since Romania joined Schengen for land borders (1 Jan 2025).
