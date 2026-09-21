import { localized, type Locale } from './i18n'
import { IMAGES } from './images'

type Triple = { en: string; am: string; om: string }

const L = (locale: Locale, values: Triple) => localized(locale, values)

export function pageCopy(locale: Locale) {
  return {
    stats: [
      { value: '820+', label: L(locale, { en: 'Students, KG–12', am: 'ተማሪዎች፣ ኬጂ–12', om: 'Barattoota, KG–12' }) },
      { value: '12:1', label: L(locale, { en: 'Student–teacher ratio', am: 'የተማሪ–መምህር ሬሾ', om: 'Hangaa barataa–barsiisaa' }) },
      { value: '98%', label: L(locale, { en: 'University placement', am: 'የዩኒቨርሲቲ ምደባ', om: 'Bakka yuunibarsiitii' }) },
      { value: '2014', label: L(locale, { en: 'Founded in Addis Ababa', am: 'በአዲስ አበባ የተመሠረተ', om: 'Finfinnee keessatti hundeeffame' }) },
    ],
    pillars: [
      {
        title: L(locale, { en: 'Know every child', am: 'እያንዳንዱን ልጅ እናውቅ', om: 'Daa’ima hundaa beekaa' }),
        body: L(locale, {
          en: 'Average class size is 18. Advisors, house parents, and a nurse know students by name — not by number.',
          am: 'አማካይ የክፍል መጠን 18 ነው። አማካሪዎች፣ የቤት ኃላፊዎች እና ነርስ ተማሪዎችን በስም ያውቃሉ።',
          om: 'Hangaan kutaa giddu-galeessaan 18 dha. Gorsitoonni, hogganoonni mana, fi narsiin barattoota maqaan beeku.',
        }),
        image: IMAGES.kids,
      },
      {
        title: L(locale, { en: 'Teach with two worlds in view', am: 'ሁለት ዓለማትን በማየት እናስተምራለን', om: 'Addunyaa lama ilaalchaa barsiifna' }),
        body: L(locale, {
          en: 'English-medium lessons from the early years, and Cambridge-aligned sciences in the upper school.',
          am: 'የእንግሊዝኛ ትምህርት፣ ከመጀመሪያ ዓመታት አማርኛ እና አፋን ኦሮሞ፣ በከፍተኛ ደረጃ ከኬምብሪጅ ጋር የተጣጣመ ሳይንስ።',
          om: 'Barnoota Ingiliffaan, Afaan Amaaraa fi Afaan Oromoo waggaa jalqabaa irraa, saayinsii Cambridge waliin walsimu kutaa ol’aanaa keessatti.',
        }),
        image: IMAGES.classroom,
      },
      {
        title: L(locale, { en: 'Grow the whole student', am: 'ሙሉ ተማሪውን እናሳድጋለን', om: 'Barataa guutuu guddisna' }),
        body: L(locale, {
          en: 'Houses, sport, music, service, and a quiet library. Character is practised on the field as much as at the Harkness-style table.',
          am: 'ቤቶች፣ ስፖርት፣ ሙዚቃ፣ አገልግሎት እና ጸጥ ያለ ቤተ መጻሕፍት። ባህሪ በሜዳም በክፍልም ይለማመዳል።',
          om: 'Manneen, ispoortii, muuziqaa, tajaajila, fi mana kitaabaa tasgabbaa’aa. Amalli dirree irrattis kutaa keessattis shaakalama.',
        }),
        image: IMAGES.sports,
      },
    ],
    pathways: [
      {
        title: L(locale, { en: 'Prospective families', am: 'አዲስ ቤተሰቦች', om: 'Maatii haaraa' }),
        body: L(locale, {
          en: 'See how to apply, tuition and aid, and book a Saturday tour.',
          am: 'እንዴት ማመልከት፣ ክፍያ እና እርዳታ፣ የቅዳሜ ጉብኝት ይያዙ።',
          om: 'Akkamitti galmaa’an, kaffaltii fi gargaarsa, daawwannaa Sanbataa qabadhaa.',
        }),
        to: '/admissions' as const,
      },
      {
        title: L(locale, { en: 'Current families', am: 'አሁን ያሉ ቤተሰቦች', om: 'Maatii ammaa' }),
        body: L(locale, {
          en: 'Grades, fees, absence, messages, and the term calendar — in one portal.',
          am: 'ውጤት፣ ክፍያ፣ መቅረት፣ መልእክት እና የወቅት ቀን መቁጠሪያ — በአንድ ፖርታል።',
          om: 'Qabxii, kaffaltii, hafuu, ergaa, fi dhaha termii — portaala tokkotti.',
        }),
        to: '/parents' as const,
      },
      {
        title: L(locale, { en: 'Alumni', am: 'ቀድሞ ተማሪዎች', om: 'Barattoota duraanii' }),
        body: L(locale, {
          en: 'Stay in the house network, mentor a senior, or give to the bursary fund.',
          am: 'በቤት መረብ ይቆዩ፣ ከፍተኛ ተማሪን ያማክሩ፣ ወይም ለእርዳታ ፈንድ ይስጡ።',
          om: 'Cimdaa mana keessatti turuu, gorsuu, ykn garaa gargaarsaa kennaa.',
        }),
        to: '/alumni' as const,
      },
      {
        title: L(locale, { en: 'Work with us', am: 'ከእኛ ጋር ይስሩ', om: 'Nu waliin hojjedhaa' }),
        body: L(locale, {
          en: 'Teaching and wellbeing roles. We hire for craft, kindness, and classroom confidence.',
          am: 'የማስተማር እና የደህንነት ስራዎች። በሙያ፣ በቸርነት እና በሁለት ቋንቋ እንቀጥራለን።',
          om: 'Hojii barsiisaa fi nageenyaa. Ogummaa, gaarummaa, fi afaan lamaanitti amantaa qabnuuf qacanna.',
        }),
        to: '/careers' as const,
      },
    ],
    quotes: [
      {
        text: L(locale, {
          en: 'The teachers know when my son is stuck — and they write to me the same afternoon. That is why we chose EIS.',
          am: 'ልጄ ሲቸገር መምህራኑ ያውቃሉ — በዚያው ከሰዓት ይጽፉልኛል። ለዚህ ነው ሆራይዘንን የመረጥነው።',
          om: 'Yeroo ilma koo rakkatu barsisaan beeku — galgala sana naaf barreessu. Kanaaf Horizon filanne.',
        }),
        by: L(locale, { en: 'Sara Hailu, parent of Yonas ’27', am: 'ሳራ ሃይሉ፣ የዮናስ ’27 እናት', om: 'Sara Hailu, haadha Yonas ’27' }),
      },
      {
        text: L(locale, {
          en: 'I can argue in English without losing my nerve. Debate club made me less afraid of being wrong.',
          am: 'በእንግሊዝኛ መከራከር እችላለሁ አሁንም በአማርኛ አስባለሁ። የክርክር ክለብ ስህተት መፍራትን ቀንሶልኛል።',
          om: 'Ingiliffaan falmuu nan danda’a, Ammayyuu Afaan Amaaraatiin yaada. Gareen marii soda dogoggoraa na hir’ise.',
        }),
        by: L(locale, { en: 'Marta Sara, Grade 6', am: 'ማርታ ሳራ፣ 6ኛ ክፍል', om: 'Marta Sara, kutaa 6' }),
      },
    ],
    history: [
      {
        year: '2014',
        title: L(locale, { en: 'Founded on Bole Road', am: 'በቦሌ መንገድ ተመሠረተ', om: 'Daandii Boolee irratti hundeeffame' }),
        body: L(locale, {
          en: 'A small KG–6 with two houses and a promise: every child known, challenged, and safe.',
          am: 'ሁለት ቤት ያለው ትንሽ ኬጂ–6፣ ቃል ኪዳን፦ እያንዳንዱ ልጅ ይታወቃል፣ ሁለት ቋንቋዎች ይኖራሉ።',
          om: 'KG–6 xiqqaa mana lamaa, waadaa: daa’imni hundi beekama, afaanonni lamaan jiraatu.',
        }),
      },
      {
        year: '2019',
        title: L(locale, { en: 'Upper school opens', am: 'ከፍተኛ ደረጃ ተከፈተ', om: 'Sadarkaan ol’aanaan bane' }),
        body: L(locale, {
          en: 'Labs, a 280-seat hall, and the first Grade 12 class. Nile, Awash, and Abbay houses take shape.',
          am: 'ላቦራቶሪ፣ 280 መቀመጫ አዳራሽ፣ የመጀመሪያው 12ኛ ክፍል። ናይል፣ አዋሽ እና አባይ ቤቶች ተቋቋሙ።',
          om: 'Laabii, oditooriyamii teessoo 280, kutaa 12 jalqabaa. Manneen Naayil, Awash, fi Abbay ijaaramani.',
        }),
      },
      {
        year: '2024',
        title: L(locale, { en: 'Library wing & portal', am: 'የቤተ መጻሕፍት ክንፍ እና ፖርታል', om: 'Kutaa mana kitaabaa fi portaala' }),
        body: L(locale, {
          en: '8,000 volumes, a reading garden, and a family portal for grades, fees, and messages.',
          am: '8,000 መጻሕፍት፣ የንባብ የአትክልት ስፍራ፣ ለውጤት፣ ክፍያ እና መልእክት የቤተሰብ ፖርታል።',
          om: 'Kitaabota 8,000, giddugalee dubbisuu, portaala maatii qabxii, kaffaltii, fi ergaaf.',
        }),
      },
    ],
    values: [
      {
        title: L(locale, { en: 'Curiosity', am: 'ጉጉት', om: 'Barbaachuu' }),
        body: L(locale, {
          en: 'Ask the next question. We grade the thinking, not only the answer.',
          am: 'ቀጣዩን ጥያቄ ጠይቅ። መልሱን ብቻ ሳይሆን አስተሳሰቡን እንመዝናለን።',
          om: 'Gaaffii itti aanu gaafadhu. Yaada madaalla, deebii qofa utuu hin taane.',
        }),
      },
      {
        title: L(locale, { en: 'Kindness', am: 'ቸርነት', om: 'Gaarummaa' }),
        body: L(locale, {
          en: 'Hold the door. Translate for a new classmate. Kindness is a skill we practise.',
          am: 'በሩን ያዝ። ለአዲስ የክፍል ጓደኛ ተርጉም። ቸርነት የምንለማመደው ክህሎት ነው።',
          om: 'Balbala qabadhu. Hiriyyaa haaraaf hiiki. Gaarummaan ogummaa shaakallu dha.',
        }),
      },
      {
        title: L(locale, { en: 'Courage', am: 'ድፍረት', om: 'Jajjabeessummaa' }),
        body: L(locale, {
          en: 'Try the hard problem. Speak in assembly. Stand up when a friend is left out.',
          am: 'ከባዱን ጥያቄ ሞክር። በስብሰባ ተናገር። ጓደኛ ሲቀር ተነሳ።',
          om: 'Gaaffii ulfaataa yaali. Walgahii irratti dubbadhu. Yeroo hiriyyaan hafte dhaabbadhu.',
        }),
      },
      {
        title: L(locale, { en: 'Service', am: 'አገልግሎት', om: 'Tajaajila' }),
        body: L(locale, {
          en: 'Non sibi — not for oneself. Seniors mentor; houses serve neighbourhood schools.',
          am: 'ለራስ ብቻ አይደለም። ከፍተኛ ተማሪዎች ያማክራሉ፤ ቤቶች የአካባቢ ትምህርት ቤቶችን ያገለግላሉ።',
          om: 'Ofii qofaaf miti. Barattoonni ol’aanoo gorsu; manneen mana barumsaa naannoo tajaajilu.',
        }),
      },
    ],
    divisions: [
      {
        grades: 'KG',
        title: L(locale, { en: 'Early years', am: 'የመጀመሪያ ዓመታት', om: 'Waggaa jalqabaa' }),
        body: L(locale, {
          en: 'Play, language, and number sense. Two teachers in every room, a garden, and rest after lunch.',
          am: 'ጨዋታ፣ ቋንቋ እና የቁጥር ስሜት። በእያንዳንዱ ክፍል ሁለት መምህራን፣ የአትክልት ስፍራ፣ ከምሳ በኋላ እረፍት።',
          om: 'Taphii, afaan, fi lakkoofsa. Barsiisota lama kutaa hunda keessa, giddugalea, fi boqonnaa nyaata booda.',
        }),
        image: IMAGES.kids,
      },
      {
        grades: '1–5',
        title: L(locale, { en: 'Elementary', am: 'የመጀመሪያ ደረጃ', om: 'Sadarkaa 1ffaa' }),
        body: L(locale, {
          en: 'Literacy and numeracy in English, specialist PE, art, and music. Homeroom teachers who stay with a class for two years.',
          am: 'በእንግሊዝኛ ንባብና ቁጥር፣ በየቀኑ አማርኛ፣ ስፖርት፣ ጥበብ እና ሙዚቃ። መምህራን ከክፍል ጋር ሁለት ዓመት ይቆያሉ።',
          om: 'Dubbisuu fi lakkoofsa Ingiliffaan, guyyaa guyyaa Afaan Amaaraa, PO, aartii, fi muuziqaa. Barsiisaan kutaa waggaa lama waliin tura.',
        }),
        image: IMAGES.classroom,
      },
      {
        grades: '6–8',
        title: L(locale, { en: 'Middle school', am: 'መካከለኛ ደረጃ', om: 'Sadarkaa giddu-galeessaa' }),
        body: L(locale, {
          en: 'Subject teachers, first labs, debate, and a choice of clubs. Advisory groups of 14 keep pastoral care close.',
          am: 'የትምህርት መምህራን፣ የመጀመሪያ ላቦራቶሪ፣ ክርክር እና ክለቦች። 14 ተማሪ ያለው የአማካሪ ቡድን እንክብካቤን ቅርብ ያደርጋል።',
          om: 'Barsiisota gosaa, laabii jalqabaa, marii, fi gareewwan. Gareen gorsaa 14 kunuunsa dhiyeessaa.',
        }),
        image: IMAGES.lab,
      },
      {
        grades: '9–12',
        title: L(locale, { en: 'Upper school', am: 'ሁለተኛ ደረጃ', om: 'Sadarkaa ol’aanaa' }),
        body: L(locale, {
          en: 'National exam preparation, Cambridge-aligned sciences, humanities, and a counsellor who starts university planning in Grade 10.',
          am: 'የብሔራዊ ፈተና ዝግጅት፣ ከኬምብሪጅ ጋር የተጣጣመ ሳይንስ፣ ሰብአዊ ትምህርት፣ ከ10ኛ ክፍል የሚጀምር የዩኒቨርሲቲ ምክር።',
          om: 'Qophii qormaata biyyaa, saayinsii Cambridge, namummaa, gorsaa yuunibarsiitii kutaa 10 irraa jalqabu.',
        }),
        image: IMAGES.library,
      },
    ],
    timeline: [
      {
        when: L(locale, { en: 'August', am: 'ነሐሴ', om: 'Hagayya' }),
        title: L(locale, { en: 'Applications open', am: 'ማመልከቻ ይከፈታል', om: 'Iyyannoon baha' }),
        body: L(locale, {
          en: 'Online form for 2026–27. Rolling review for mid-year places.',
          am: 'ለ2019 ዓ.ም የመስመር ላይ ቅጽ። በዓመቱ መሃል ቦታ ካለ በተከታታይ እንመለከታለን።',
          om: 'Unka toora irratti 2026–27. Bakki gidduu waggaa yoo jiraate ilaalama.',
        }),
      },
      {
        when: L(locale, { en: 'Saturdays', am: 'ቅዳሜዎች', om: 'Sanbatawwan' }),
        title: L(locale, { en: 'Open campus, 10:00', am: 'ክፍት ግቢ፣ 10:00', om: 'Kampasii banaa, 10:00' }),
        body: L(locale, {
          en: 'Tour, meet teachers, sit in on a sample lesson. Book a slot online.',
          am: 'ጉብኝት፣ መምህራንን ያግኙ፣ የናሙና ትምህርት። በመስመር ላይ ቦታ ይያዙ።',
          om: 'Daawwannaa, barsiisota argadhaa, barnoota fakkeenyaa. Toora irratti qabadhaa.',
        }),
      },
      {
        when: L(locale, { en: 'Within 10 days', am: 'በ10 ቀን ውስጥ', om: 'Guyyaa 10 keessatti' }),
        title: L(locale, { en: 'Assessment & family meeting', am: 'ግምገማ እና የቤተሰብ ስብሰባ', om: 'Madaallii fi walga’ii maatii' }),
        body: L(locale, {
          en: 'A gentle placement task matched to the grade, then a conversation with admissions.',
          am: 'ከክፍሉ ጋር የተመጣጠነ ግምገማ፣ ከዚያ ከመግቢያ ጽሕፈት ቤት ውይይት።',
          om: 'Hojii madaallii kutaa wajjin walsimu, ergasii marii galmee.',
        }),
      },
      {
        when: L(locale, { en: 'March–June', am: 'መጋቢት–ሰኔ', om: 'Bitootessa–Waxabajjii' }),
        title: L(locale, { en: 'Offers & enrolment', am: 'ቅናሽ እና ምዝገባ', om: 'Dhiyeessii fi galmee' }),
        body: L(locale, {
          en: 'Written offer, bursary decision if you applied, and a place held for 14 days.',
          am: 'የጽሑፍ ቅናሽ፣ እርዳታ ካመለከቱ ውሳኔ፣ ቦታ ለ14 ቀን ይያዛል።',
          om: 'Dhiyeessii barreessaa, murtii gargaarsaa yoo iyyattan, bakki guyyaa 14 qabama.',
        }),
      },
    ],
    documents: [
      L(locale, { en: 'Birth certificate or passport', am: 'የልደት ሰርተፍኬት ወይም ፓስፖርት', om: 'Ragaa dhalootaa ykn paaspoortii' }),
      L(locale, { en: 'Two years of school reports', am: 'የሁለት ዓመት የትምህርት ሪፖርት', om: 'Gabaasa mana barumsaa waggaa lama' }),
      L(locale, { en: 'Vaccination record', am: 'የክትባት መዝገብ', om: 'Galmee talaallii' }),
      L(locale, { en: 'Passport photo of the child', am: 'የልጁ የፓስፖርት ፎቶ', om: 'Suuraa paaspoortii daa’imaa' }),
      L(locale, { en: 'Parent ID and proof of address', am: 'የወላጅ መታወቂያ እና የመኖሪያ ማስረጃ', om: 'Wabii maatii fi ragaa teessoo' }),
    ],
    houses: [
      {
        name: 'Nile',
        colour: L(locale, { en: 'Blue', am: 'ሰማያዊ', om: 'Cuquliisa' }),
        motto: L(locale, { en: 'Steady and deep', am: 'ረጋ ያለ እና ጥልቅ', om: 'Tasgabbaa’aa fi gadi fagoo' }),
      },
      {
        name: 'Awash',
        colour: L(locale, { en: 'Gold', am: 'ወርቃማ', om: 'Warqee' }),
        motto: L(locale, { en: 'Fast and joyful', am: 'ፈጣን እና ደስተኛ', om: 'Saffisaa fi gammachuu' }),
      },
      {
        name: 'Abbay',
        colour: L(locale, { en: 'Green', am: 'አረንጓዴ', om: 'Magariisa' }),
        motto: L(locale, { en: 'Rooted and generous', am: 'ሥር የሰደደ እና ለጋስ', om: 'Hundeessaa fi kennaa' }),
      },
    ],
    clubs: [
      L(locale, { en: 'Science & robotics', am: 'ሳይንስ እና ሮቦቲክስ', om: 'Saayinsii fi robootiksii' }),
      L(locale, { en: 'Debate & Model UN', am: 'ክርክር እና ሞዴል ዩኤን', om: 'Marii fi Model UN' }),
      L(locale, { en: 'Coding', am: 'ኮዲንግ', om: 'Koodii' }),
      L(locale, { en: 'Chess', am: 'ቼዝ', om: 'Cheess' }),
      L(locale, { en: 'Environment', am: 'አካባቢ', om: 'Naannoo' }),
      L(locale, { en: 'Journalism', am: 'ጋዜጠኝነት', om: 'Gaazexeessummaa' }),
    ],
    sports: [
      L(locale, { en: 'Football', am: 'እግር ኳስ', om: 'Kubbaa miilaa' }),
      L(locale, { en: 'Basketball', am: 'ቅርጫት ኳስ', om: 'Kubbaa harkaa' }),
      L(locale, { en: 'Athletics', am: 'አትሌቲክስ', om: 'Atileetiksii' }),
      L(locale, { en: 'Swimming (off-site)', am: 'ዋና (ውጪ)', om: 'Dabalaa (ala)' }),
      L(locale, { en: 'Table tennis', am: 'የጠረጴዛ ቴኒስ', om: 'Teennisii minjaalaa' }),
      L(locale, { en: 'House games', am: 'የቤት ጨዋታዎች', om: 'Taphoota mana' }),
    ],
    artsList: [
      L(locale, { en: 'Choir & orchestra', am: 'መዘምራን እና ኦርኬስትራ', om: 'Choerii fi orkeestraa' }),
      L(locale, { en: 'Drama', am: 'ቲያትር', om: 'Tiyaatira' }),
      L(locale, { en: 'Visual arts', am: 'የእይታ ጥበብ', om: 'Aartii ija' }),
      L(locale, { en: 'Traditional dance', am: 'ባህላዊ ዳንስ', om: 'Shubbisa aadaa' }),
      L(locale, { en: 'Photography club', am: 'የፎቶግራፍ ክለብ', om: 'Garee suuraa' }),
    ],
    tourStops: [
      {
        title: L(locale, { en: 'Main gate & courtyard', am: 'ዋና በር እና አደባባይ', om: 'Balbala ijoo fi dirree' }),
        body: L(locale, {
          en: 'Families arrive under the jacarandas. Reception, the principal’s office, and the first glimpse of the south field.',
          am: 'ቤተሰቦች ከጃካራንዳ ዛፎች ሥር ይደርሳሉ። መቀበያ፣ የርዕሰ መምህሩ ቢሮ፣ የደቡብ ሜዳ የመጀመሪያ እይታ።',
          om: 'Maatiin muka jacaranda jala gahu. Simannaa, waajjira itti gaafatamaa, ilaalcha jalqabaa dirree kibbaa.',
        }),
        image: IMAGES.courtyard,
      },
      {
        title: L(locale, { en: 'Library wing', am: 'የቤተ መጻሕፍት ክንፍ', om: 'Kutaa mana kitaabaa' }),
        body: L(locale, {
          en: 'Quiet rooms, a picture-book corner, and a reading garden open until 17:00.',
          am: 'ጸጥ ያሉ ክፍሎች፣ የሁለት ቋንቋ የስዕል መጻሕፍት ማእዘን፣ እስከ 17:00 የሚከፈት የንባብ የአትክልት ስፍራ።',
          om: 'Kutaa tasgabbaa’aa, gola kitaaba suuraa afaan lamaa, giddugalee dubbisuu hanga 17:00.',
        }),
        image: IMAGES.library,
      },
      {
        title: L(locale, { en: 'Science labs', am: 'የሳይንስ ላቦራቶሪ', om: 'Laabii saayinsii' }),
        body: L(locale, {
          en: 'Two labs for biology, chemistry, and physics practicals from Grade 7.',
          am: 'ከ7ኛ ክፍል ጀምሮ ለባዮሎጂ፣ ኬሚስትሪ እና ፊዚክስ ሁለት ላቦራቶሪ።',
          om: 'Laabii lama baayoloojii, keemistirii, fi fiziksii kutaa 7 irraa.',
        }),
        image: IMAGES.lab,
      },
      {
        title: L(locale, { en: 'Hall & south field', am: 'አዳራሽ እና ደቡብ ሜዳ', om: 'Oditooriyamii fi dirree kibbaa' }),
        body: L(locale, {
          en: '280 seats for music and assembly; football, athletics, and house games outside.',
          am: 'ለሙዚቃ እና ስብሰባ 280 መቀመጫ፤ ውጪ እግር ኳስ፣ አትሌቲክስ እና የቤት ጨዋታዎች።',
          om: 'Teessoo 280 muuziqaa fi walgahiif; ala kubbaa miilaa, atileetiksii, taphoota mana.',
        }),
        image: IMAGES.assembly,
      },
    ],
    extraFaqs: [
      {
        q: L(locale, { en: 'When can we visit?', am: 'መቼ መጎብኘት እንችላለን?', om: 'Yoom daawwachuu dandeenya?' }),
        a: L(locale, {
          en: 'Open campus every Saturday at 10:00 in term time. Mid-week tours by appointment. Book on the Visit page.',
          am: 'በትምህርት ወቅት በየቅዳሜው 10:00 ክፍት ግቢ። በሳምንቱ መሃል በቀጠሮ። በጉብኝት ገጽ ይያዙ።',
          om: 'Yeroo termii Sanbata hunda sa’aatii 10:00. Torbee gidduu beellama. Fuula daawwannaa irratti qabadhaa.',
        }),
      },
      {
        q: L(locale, { en: 'Do you offer financial aid?', am: 'የገንዘብ እርዳታ ትሰጣላችሁ?', om: 'Gargaarsa maallaqaa ni kennituu?' }),
        a: L(locale, {
          en: 'Yes. Bursaries cover 15–80% of tuition. Apply at the same time as admission; the decision is need-based and separate from the academic offer.',
          am: 'አዎ። እርዳታ ከ15–80% የትምህርት ክፍያ ይሸፍናል። ከመግቢያ ጋር በአንድ ጊዜ ያመልክቱ፤ ውሳኔው በፍላጎት ላይ የተመሠረተ ነው።',
          om: 'Eeyyee. Gargaarsi kaffaltii 15–80% uwwisa. Galmee wajjin iyyadhaa; murtiin fedhii irratti hundaa’a.',
        }),
      },
      {
        q: L(locale, { en: 'Is lunch included?', am: 'ምሳ ተካትቷል?', om: 'Nyaanni guyyaa keessa jiraa?' }),
        a: L(locale, {
          en: 'A hot lunch is included in tuition. The weekly menu is posted in the parent portal every Sunday evening.',
          am: 'ሙቅ ምሳ በክፍያው ውስጥ ነው። ሳምንታዊ ምናሌ እሁድ ማታ በወላጅ ፖርታል ይለጠፋል።',
          om: 'Nyaanni ho’aan kaffaltii keessa jira. Menyuun torbee Dilbata galgala portaala maatii irratti maxxanfama.',
        }),
      },
      {
        q: L(locale, { en: 'How do you keep children safe?', am: 'ልጆችን እንዴት ትጠብቃላችሁ?', om: 'Ijoollee akkamitti eegdu?' }),
        a: L(locale, {
          en: 'Gated campus, trained duty staff, a nurse on site, and a named safeguarding lead. Read the policy in Downloads.',
          am: 'በር ያለው ግቢ፣ የሰለጠነ ተረኛ ሠራተኛ፣ በግቢው ነርስ፣ የተሰየመ የደህንነት ኃላፊ። መመሪያውን በማውረድ ያንብቡ።',
          om: 'Kampasii cufaa, hojjettoota leenjifaman, narsii, hogganaa nageenyaa. Imaammata Buusuu keessatti dubbisaa.',
        }),
      },
    ],
    parentCards: [
      {
        title: L(locale, { en: 'Family portal', am: 'የቤተሰብ ፖርታል', om: 'Portaala maatii' }),
        body: L(locale, {
          en: 'Grades, attendance, assignments, messages, fees, and absence requests.',
          am: 'ውጤት፣ መገኘት፣ የቤት ስራ፣ መልእክት፣ ክፍያ እና የመቅረት ጥያቄ።',
          om: 'Qabxii, argamuu, hojii mana, ergaa, kaffaltii, fi gaaffii hafuu.',
        }),
        to: '/login' as const,
      },
      {
        title: L(locale, { en: 'Calendar & closures', am: 'ቀን መቁጠሪያ እና መዘጋት', om: 'Dhaha fi cufamuu' }),
        body: L(locale, {
          en: 'Term dates, sports fixtures, and unexpected closures on the public calendar and in the alert bar.',
          am: 'የወቅት ቀናት፣ የስፖርት ጨዋታዎች እና ያልተጠበቀ መዘጋት በቀን መቁጠሪያ እና በማስጠንቀቂያ ባር።',
          om: 'Guyyaawwan termii, taphoota ispoortii, cufamuu tasaa dhaha fi baarii akeekkachiisaa irratti.',
        }),
        to: '/events' as const,
      },
      {
        title: L(locale, { en: 'Handbooks & forms', am: 'መመሪያዎች እና ቅጾች', om: 'Qajeelfama fi unkowwan' }),
        body: L(locale, {
          en: 'Student handbook, uniform guide, and the term calendar as downloadable files.',
          am: 'የተማሪ መመሪያ፣ የደንብ ልብስ መመሪያ እና የወቅት ቀን መቁጠሪያ ለማውረድ።',
          om: 'Kitaaba barataa, qajeelfama uffataa, fi dhaha termii buusuu danda’amu.',
        }),
        to: '/downloads' as const,
      },
      {
        title: L(locale, { en: 'Bus, lunch, uniform', am: 'አውቶቡስ፣ ምሳ፣ ደንብ ልብስ', om: 'Awtobusii, nyaata, uffata' }),
        body: L(locale, {
          en: 'Bole, CMC, and Old Airport routes. Hot lunch included. Teal polo and khaki on weekdays.',
          am: 'የቦሌ፣ ሲኤምሲ እና ኦልድ ኤርፖርት መስመሮች። ሙቅ ምሳ ተካትቷል። በሳምንቱ ቴል ፖሎ እና ካኪ።',
          om: 'Karaawwan Boolee, CMC, Old Airport. Nyaata ho’aa keessa. Polo tiilii fi khaki torbee keessa.',
        }),
        to: '/faq' as const,
      },
    ],
    destinations: [
      { short: 'AAU', name: L(locale, { en: 'Addis Ababa University', am: 'አዲስ አበባ ዩኒቨርሲቲ', om: 'Yuunibarsiitii Finfinnee' }) },
      { short: 'UU', name: L(locale, { en: 'Unity University', am: 'ዩኒቲ ዩኒቨርሲቲ', om: 'Yuunibarsiitii Unity' }) },
      { short: 'ASH', name: L(locale, { en: 'Ashesi University', am: 'አሼሲ ዩኒቨርሲቲ', om: 'Yuunibarsiitii Ashesi' }) },
      { short: 'UoN', name: L(locale, { en: 'University of Nairobi', am: 'የናይሮቢ ዩኒቨርሲቲ', om: 'Yuunibarsiitii Naayroobii' }) },
      { short: 'ALU', name: L(locale, { en: 'African Leadership University', am: 'አፍሪካ ሊደርሺፕ ዩኒቨርሲቲ', om: 'Yuunibarsiitii Hogganummaa Afrikaa' }) },
      { short: 'UCT', name: L(locale, { en: 'University of Cape Town', am: 'የኬፕ ታውን ዩኒቨርሲቲ', om: 'Yuunibarsiitii Cape Town' }) },
      { short: 'SU', name: L(locale, { en: 'Stellenbosch University', am: 'ስቴለንቦሽ ዩኒቨርሲቲ', om: 'Yuunibarsiitii Stellenbosch' }) },
      { short: 'UofT', name: L(locale, { en: 'University of Toronto', am: 'የቶሮንቶ ዩኒቨርሲቲ', om: 'Yuunibarsiitii Toronto' }) },
      { short: 'UoM', name: L(locale, { en: 'University of Manchester', am: 'የማንቸስተር ዩኒቨርሲቲ', om: 'Yuunibarsiitii Manchester' }) },
      { short: 'TUD', name: L(locale, { en: 'TU Delft', am: 'ቲዩ ዴልፍት', om: 'TU Delft' }) },
    ],
    policies: [
      {
        title: L(locale, { en: 'Safeguarding', am: 'የልጅ ደህንነት', om: 'Eegumsa daa’imaa' }),
        body: L(locale, {
          en: 'Every adult on campus is trained. Concerns go to the designated safeguarding lead the same day. The full policy is in Downloads.',
          am: 'በግቢው ያለ እያንዳንዱ ጎልማሳ ስልጠና ወስዷል። ስጋቶች በዚያው ቀን ወደ የደህንነት ኃላፊ ይሄዳሉ። ሙሉ መመሪያው በማውረድ አለ።',
          om: 'Ga’eessota kampasii hundi leenjifamaniiru. Yaaddoonni guyyaa sana hogganaa nageenyaatti darbu. Imaammati guutuun Buusuu keessa jira.',
        }),
      },
      {
        title: L(locale, { en: 'Privacy', am: 'ግላዊነት', om: 'Dhuunfaa' }),
        body: L(locale, {
          en: 'Student records stay in the portal. We do not sell data. Photos of children appear only with parent consent.',
          am: 'የተማሪ መዝገቦች በፖርታል ውስጥ ይቀመጣሉ። መረጃ አንሸጥም። የልጆች ፎቶ በወላጅ ፈቃድ ብቻ ይታያል።',
          om: 'Galmeen barataa portaala keessa tura. Data hin gurgurru. Suuraan ijoollee hayyama maatii qofa agarsiifama.',
        }),
      },
      {
        title: L(locale, { en: 'Anti-bullying', am: 'ፀረ-ማንገላታት', om: 'Farra hiraarsa' }),
        body: L(locale, {
          en: 'Houses and advisors act on reports within 24 hours. Restoration comes before punishment whenever it is safe to do so.',
          am: 'ቤቶች እና አማካሪዎች በ24 ሰዓት ውስጥ ሪፖርት ላይ ይሰራሉ። ደህንነት ሲኖር መጀመሪያ መጠገን ነው።',
          om: 'Manneen fi gorsitoonni gabaasa sa’aatii 24 keessatti hojjetu. Nageenyi yoo jiraate deebisuu adabbii dura dhufa.',
        }),
      },
      {
        title: L(locale, { en: 'Accessibility', am: 'ተደራሽነት', om: 'Dhaqqabummaa' }),
        body: L(locale, {
          en: 'This website works on phones, is written in English, and uses clear headings. Ask admissions about physical access on campus.',
          am: 'ይህ ድረ-ገጽ በስልክ ይሰራል፣ እንግሊዝኛ፣ አማርኛ እና አፋን ኦሮሞን ይደግፋል። ስለ ግቢው አካላዊ ተደራሽነት መግቢያን ይጠይቁ።',
          om: 'Marsariitiin kun bilbila irratti hojjeta, Ingiliffaa, Afaan Amaaraa, Afaan Oromoo deeggara. Dhaqqabummaa qaamaa kampasii galmee gaafadhaa.',
        }),
      },
    ],
  }
}
