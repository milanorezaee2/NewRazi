import type {
  AnnouncementBarConfig,
  Banner,
  Collection,
  EducationItem,
  HomeSection,
  LiveEventConfig,
  Portfolio,
  SeoMeta,
  Story,
} from "../../types";
import { RAZIEH_TEXTILE_PORTFOLIO } from "../razieh-textile-portfolio";
import { L } from "./helpers";

/* ------------------------------------------------------------------ */
/* Portfolios                                                           */
/* ------------------------------------------------------------------ */
export const portfolios: Portfolio[] = [
  {
    id: "portfolio-penthouse-elaheye",
    slug: "penthouse-elaheye",
    title: L("پنت‌هاوس الهیه؛ روایت مس روی اسلیت", "Elahieh Penthouse — Copper on Slate"),
    subtitle: L("پترن گیاهی با خطوط مسی برای پنجره‌های قوسی", "A botanical with copper linework for arched windows"),
    intro: L("برای این پنت‌هاوس ۲۸۰ متری، یک پترن گیاهی با خطوط مسی روی زمینه‌ی اسلیت طراحی شد تا نور صبحگاهی پنجره‌های قوسی را بازتاب دهد.", "For this 280 m² penthouse, a bespoke botanical with copper linework on a slate ground was colour-matched to the morning light of the arched windows."),
    story: [
      { type: "text", text: L("رنگ‌بندی اختصاصی در سه مرحله نمونه‌گیری نهایی شد تا با نور طبیعی پنجره‌های قوسی هماهنگ شود.", "The custom colourway was finalised across three sampling rounds to harmonise with the natural light of the arched windows.") },
      { type: "image", image: "/images/portfolios/pf-penthouse.jpg", caption: L("نمای کلی فضا پس از نصب", "Space overview after installation") },
      { type: "quote", text: L("پترن نباید فریاد بزند؛ باید مثل نور صبح وارد فضا شود.", "A pattern shouldn't shout — it should enter the room like morning light.") },
      { type: "text", text: L("متریال نان‌وون پریمیوم ۲۰۰ گرم انتخاب شد و نصب در ۱۸ روز به پایان رسید.", "A 200 gsm premium non-woven substrate was chosen; installation was completed in 18 days.") },
    ],
    cover: "/images/portfolios/pf-penthouse.jpg",
    gallery: ["/images/portfolios/pf-penthouse.jpg", "/images/patterns/p01.jpg"],
    artistId: "artist-niloufar-rad", patternIds: ["pattern-quiet-garden"], productIds: ["product-wallpaper-quiet-garden", "product-curtain-quiet-garden"],
    client: L("خصوصی", "Private"), location: L("تهران، الهیه", "Tehran, Elahieh"), year: 2025,
    scope: L("طراحی اختصاصی، تولید، نصب", "Bespoke design, production, installation"),
    categoryId: "cat-persian", featured: true, isProject: true, size: "hero",
    caseStudy: {
      problem: L(
        "پنجره‌های قوسی نور صبح را مستقیم روی دیوار می‌انداختند؛ هر پترن پرکنتراست در آن نور سرد و تصنعی دیده می‌شد و با مبلمان روشن فضا رقابت می‌کرد.",
        "The arched windows threw morning light straight onto the wall; any high-contrast pattern looked cold and synthetic there and competed with the pale furniture.",
      ),
      process: [
        { title: L("تحلیل نور", "Light study"), text: L("دو ساعت از روز در سه فصل اندازه‌گیری شد تا زاویه و دمای نور در محل پترن مشخص شود.", "The room was measured at two hours across three seasons to map light angle and temperature on the pattern wall.") },
        { title: L("ساخت رنگ‌بندی", "Colourway build"), text: L("زمینه‌ی اسلیت با سه پله روشن‌تر و خطوط مسی مات انتخاب شد تا در نور مستقیم نسوزد.", "The slate ground was lifted three steps and the copper linework kept matte so it does not burn out in direct light.") },
        { title: L("نمونه‌ی مقیاس‌واقعی", "Full-scale sample"), text: L("یک پانل ۲×۲ متر روی همان دیوار نصب و در سه نوبت بازبینی شد.", "A 2×2 m panel was installed on the same wall and reviewed on three separate visits.") },
      ],
      outcome: L(
        "پترن در طول روز سه حالت متفاوت دارد و هیچ‌کدام شلوغ نیست؛ فضا بدون تغییر مبلمان بزرگ‌تر خوانده می‌شود.",
        "The pattern reads differently across the day and never feels busy; the room appears larger without touching a single piece of furniture.",
      ),
      outcomeMetrics: [
        { label: L("مساحت اجرا", "Installed area"), value: "۲۸۰ m²" },
        { label: L("مرحله رنگ‌بندی", "Colourway rounds"), value: "۳" },
        { label: L("زمان نصب", "Installation"), value: "۱۸ " + "روز" },
      ],
      tools: ["Adobe Illustrator", "Pantone TPG", "Non-woven 200gsm"],
    },
  },
  {
    id: "portfolio-hotel-narenjestan",
    slug: "hotel-narenjestan",
    title: L("هتل بوتیک نارنجستان؛ لابی شب‌رنگ", "Narenjestan Boutique Hotel — Lobby"),
    subtitle: L("پترن مشبک هندسی ایرانی با خطوط مسی روی اسلیت تیره", "Persian lattice in copper line on deep slate"),
    intro: L("لابی هتل با یک پترن مشبک هندسی ایرانی با خطوط مسی روی اسلیت تیره پوشیده شد؛ ترکیبی که در نور آویزها عمق پیدا می‌کند.", "The hotel lobby was clad in a Persian lattice in copper line on deep slate — a combination that gains depth under pendant light."),
    story: [
      { type: "image", image: "/images/portfolios/pf-hotel.jpg", caption: L("لابی پس از نصب", "Lobby after installation") },
      { type: "text", text: L("پترن با مخمل آبی مبلمان گفت‌وگو می‌کند و عمق شب‌رنگ فضا را تکمیل می‌کند.", "The pattern converses with the blue velvet seating and completes the nocturnal depth of the space.") },
      { type: "pair", images: ["/images/patterns/p08.jpg", "/images/portfolios/pf-hotel.jpg"], caption: L("پترن در کنار فضای نهایی", "Pattern beside the finished space") },
      { type: "text", text: L("متریال وینیل تجاری ضدخش کلاس B1 در ۱۴۰ متر مربع در ۲۶ روز نصب شد.", "Class B1 commercial anti-scratch vinyl — 140 m² installed in 26 days.") },
    ],
    cover: "/images/portfolios/pf-hotel.jpg",
    gallery: ["/images/portfolios/pf-hotel.jpg", "/images/patterns/p08.jpg"],
    artistId: "artist-arman-kian", patternIds: ["pattern-copper-damask"], productIds: ["product-wallpaper-copper-damask", "product-curtain-copper-damask"],
    client: L("هتل بوتیک نارنجستان", "Narenjestan Boutique Hotel"), location: L("تهران", "Tehran"), year: 2025,
    scope: L("طراحی پترن، کاغذدیواری تجاری، پرده، نصب", "Pattern design, commercial wallpaper, curtains, installation"),
    categoryId: "cat-luxury", featured: true, isProject: true, size: "tall",
    caseStudy: {
      problem: L(
        "لابی با سقف بلند و آویزهای متعدد در شب زیاد و در روز خالی دیده می‌شد؛ پترن باید در هر دو حالت وزن بصری یکسانی داشت.",
        "The tall lobby with multiple pendants looked crowded at night and empty by day; the pattern had to hold the same visual weight in both states.",
      ),
      process: [
        { title: L("مودبورد شب", "Night board"), text: L("پترن در نور واقعی آویزها شبیه‌سازی شد تا عمق خطوط مسی سنجیده شود.", "The pattern was simulated under the real pendant lighting to judge the depth of the copper lines.") },
        { title: L("مشبک ایرانی", "Persian lattice"), text: L("هندسه‌ی مشبک با تکرار ۳۲ سانتی‌متر ساده شد تا از فاصله‌ی پذیرش خوانا بماند.", "The lattice geometry was simplified at a 32 cm repeat so it stays legible from the reception desk.") },
        { title: L("متریال تجاری", "Commercial substrate"), text: L("وینیل ضدخش کلاس B1 برای مسیر پرتردد و مقاومت در برابر شست‌وشو انتخاب شد.", "Class B1 anti-scratch vinyl was chosen for the high-traffic route and wash-down resistance.") },
      ],
      outcome: L(
        "لابی در شب عمق پیدا می‌کند و در روز آرام است؛ سطح در ۱۴ ماه بهره‌برداری هیچ آسیب موضعی نداشته.",
        "The lobby gains depth at night and calms by day; after fourteen months of use the surface shows no localised damage.",
      ),
      outcomeMetrics: [
        { label: L("مساحت", "Area"), value: "۱۴۰ m²" },
        { label: L("زمان اجرا", "Delivery"), value: "۲۶ " + "روز" },
        { label: L("کلاس آتش", "Fire class"), value: "B1" },
      ],
      tools: ["Rhino", "Illustrator", "Class B1 vinyl"],
    },
  },
  {
    id: "portfolio-villa-lavasan",
    slug: "villa-lavasan",
    title: L("ویلای لواسان؛ آرامش گل و برگ", "Lavasan Villa — Master Bedroom"),
    subtitle: L("پترن آبرنگی گل‌های صدتومانی روی زمینه‌ی عاجی گرم", "Watercolour peonies on warm ivory"),
    intro: L("دیوار تاج تخت با پترن آبرنگی از گل‌های صدتومانی و برگ‌های مریم‌گلی اجرا شد؛ مقیاس طوری تنظیم شد که از فاصله‌ی تخت، آرام و بی‌تکرار دیده شود.", "The headboard wall was executed with a watercolour peony and sage botanical — scaled so the repeat disappears from the bed's viewpoint."),
    story: [
      { type: "image", image: "/images/portfolios/pf-bedroom.jpg" },
      { type: "text", text: L("متریال کاغذ بافت‌دار مات با تکرار ۹۶ سانتی‌متر در ۲۲ متر مربع اجرا شد.", "Textured matte paper with a 96 cm repeat — 22 m² installed in 5 days.") },
    ],
    cover: "/images/portfolios/pf-bedroom.jpg",
    gallery: ["/images/portfolios/pf-bedroom.jpg", "/images/patterns/p03.jpg"],
    artistId: "artist-sara-mehr", patternIds: ["pattern-dusty-bloom"], productIds: ["product-fabric-dusty-bloom", "product-wallpaper-quiet-garden"],
    client: L("خصوصی", "Private"), location: L("لواسان", "Lavasan"), year: 2024,
    scope: L("کاغذدیواری و پارچه سفارشی", "Bespoke wallpaper & fabric"),
    categoryId: "cat-floral", featured: true, isProject: false, size: "square",
    caseStudy: {
      problem: L(
        "دیوار پشت تخت فقط از فاصله‌ی ۴۰ سانتی‌متر دیده می‌شود؛ تکرارهای کوچک از آن فاصله به نویز تبدیل می‌شدند.",
        "The headboard wall is only ever seen from 40 cm away, where small repeats turn into noise.",
      ),
      process: [
        { title: L("تعیین مقیاس", "Scale test"), text: L("سه مقیاس چاپ شد و از فاصله‌ی واقعی تخت مقایسه شد؛ ۹۶ سانتی‌متر انتخاب شد.", "Three scales were printed and compared from the real bed distance; 96 cm won.") },
        { title: L("تنظیم آب‌رنگ", "Watercolour tuning"), text: L("لبه‌های گل با شفافیت کنترل‌شده چاپ شد تا بافت دستی زیر نور حفظ شود.", "Petal edges were printed with controlled transparency so the hand-painted texture survives the light.") },
        { title: L("کاغذ بافت‌دار", "Textured paper"), text: L("کاغذ مات با بافت ملایم انتخاب شد تا انعکاس نور کنار تخت حذف شود.", "A matte, softly textured paper removes reflections beside the bed.") },
      ],
      outcome: L(
        "از فاصله‌ی تخت، گل‌ها بی‌تکرار و آرام دیده می‌شوند؛ از در ورودی، دیوار یک سطح رنگی یکدست است.",
        "From the bed the flowers are calm and unresolvable; from the doorway the wall reads as one continuous colour field.",
      ),
      outcomeMetrics: [
        { label: L("تکرار", "Repeat"), value: "۹۶ cm" },
        { label: L("مساحت", "Area"), value: "۲۲ m²" },
        { label: L("نصب", "Install"), value: "۵ " + "روز" },
      ],
      tools: ["Gouache scans", "Photoshop", "Textured matte paper"],
    },
  },
  {
    id: "portfolio-cafe-sangfarsh",
    slug: "cafe-sangfarsh",
    title: L("کافه‌ی سنگ‌فرش؛ انتزاع ترازو", "Sangfarsh Café — Terrazzo Abstract"),
    subtitle: L("دیوار شاخص، خودش اثر هنری است", "The feature wall becomes the artwork itself"),
    intro: L("برای فضای صنعتی-مینیمال کافه، یک پترن انتزاعی با ضربه‌قلم‌های مشکی، شنی و مسی در ابعاد بزرگ طراحی شد.", "For the industrial-minimal café, a large-scale brushstroke abstraction in black, sand and copper was designed."),
    story: [
      { type: "image", image: "/images/portfolios/pf-cafe.jpg" },
      { type: "text", text: L("وینیل مات ضدلک بدون تکرار به‌صورت پانل سفارشی در ۱۸ متر مربع در ۳ روز نصب شد.", "Matte anti-stain vinyl with no repeat — custom panel, 18 m² in 3 days.") },
    ],
    cover: "/images/portfolios/pf-cafe.jpg",
    gallery: ["/images/portfolios/pf-cafe.jpg", "/images/patterns/p05.jpg"],
    artistId: null, patternIds: ["pattern-torn-paper"], productIds: [],
    client: L("کافه سنگ‌فرش", "Sangfarsh Café"), location: L("کرج", "Karaj"), year: 2024,
    scope: L("طراحی پترن، چاپ پانل سفارشی", "Pattern design, custom panel print"),
    categoryId: "cat-abstract", featured: true, isProject: true, size: "wide",
    caseStudy: {
      problem: L(
        "دیوار بتنی در نور کمِ عصر تقریباً سیاه می‌شد و لکه‌های قهوه روی سطح مات قابل پاک‌شدن نبود.",
        "The concrete wall went almost black in the low afternoon light, and coffee spills on a matte surface could not be cleaned.",
      ),
      process: [
        { title: L("پانل بدون تکرار", "No-repeat panel"), text: L("به‌جای تکرار، یک پانل ۵ متری اختصاصی طراحی شد تا دیوار مثل یک اثر خوانده شود.", "Instead of a repeat, a single 5 m panel was drawn so the wall reads as one artwork.") },
        { title: L("پالت گرم", "Warm palette"), text: L("مشکی صفر-تا-صد با شنی و مسی ترکیب شد تا در نور کم عمق بماند.", "A true black was mixed with sand and copper so the wall holds depth in low light.") },
        { title: L("پوشش ضدلک", "Anti-stain film"), text: L("وینیل مات با پوشش ضدلک و درزهای پنهان در محل اجرا شد.", "Matte vinyl with an anti-stain coating and concealed seams was installed on site.") },
      ],
      outcome: L(
        "دیوار در عصر عمق پیدا می‌کند و لکه‌ها با یک دستمال مرطوب پاک می‌شوند؛ خود دیوار به نقطه‌ی عکس‌گرفتن کافه تبدیل شد.",
        "The wall gains depth at dusk, spills wipe off with a damp cloth, and the wall itself became the café's photo spot.",
      ),
      outcomeMetrics: [
        { label: L("مساحت", "Area"), value: "۱۸ m²" },
        { label: L("اجرا", "Install"), value: "۳ " + "روز" },
        { label: L("تکرار", "Repeat"), value: "—" },
      ],
      tools: ["Brush scans", "Illustrator", "Anti-stain vinyl"],
    },
  },
  {
    id: "portfolio-nursery-moon-cloud",
    slug: "nursery-moon-cloud",
    title: L("اتاق نوزاد؛ ماه، ابر و بالن", "Nursery — Moon, Cloud & Balloon"),
    subtitle: L("چاپ با جوهر پایه‌آب، مناسب اتاق نوزاد", "Printed with odourless water-based inks"),
    intro: L("پترن پاستلی با ماه‌های خواب‌آلود، ابر و بالن‌های کوچک در کرم، آبی پودری و خردلی؛ چاپ با جوهر پایه‌آب بدون بو.", "A pastel nursery pattern with sleepy moons, clouds and little balloons in cream, powder blue and mustard — printed with odourless water-based inks."),
    story: [
      { type: "image", image: "/images/portfolios/pf-kids.jpg" },
      { type: "text", text: L("نان‌وون بدون PVC با جوهر گرین‌گارد، مناسب اتاق نوزاد؛ ۱۴ متر مربع در ۲ روز.", "PVC-free non-woven with GreenGuard ink — 14 m² in 2 days.") },
    ],
    cover: "/images/portfolios/pf-kids.jpg",
    gallery: ["/images/portfolios/pf-kids.jpg", "/images/patterns/p07.jpg"],
    artistId: "artist-sara-mehr", patternIds: ["pattern-little-moons"], productIds: [],
    client: L("خصوصی", "Private"), location: L("تهران", "Tehran"), year: 2025,
    scope: L("کاغذ دیواری کودک", "Kids wallpaper"),
    categoryId: "cat-kids", featured: true, isProject: false, size: "square",
    caseStudy: {
      problem: L(
        "اتاق نوزاد باید بدون بو و بدون PVC اجرا می‌شد و رنگ‌ها نباید در نور شبانه به خاکستری می‌افتادند.",
        "The nursery had to be installed odour-free and PVC-free, and the pastels could not collapse into grey under night lighting.",
      ),
      process: [
        { title: L("پالت روز و شب", "Day & night palette"), text: L("رنگ‌ها زیر دو دمای نوری تست شد تا کرم و آبی پودری در هر دو حالت زنده بمانند.", "Colours were tested under two light temperatures so cream and powder blue stay alive in both.") },
        { title: L("جوهر گرین‌گارد", "GreenGuard ink"), text: L("چاپ با جوهر پایه‌آب و گواهی نشر کم‌آلاینده انجام شد.", "Printed with water-based, low-emission certified inks.") },
        { title: L("نصب سریع", "Fast install"), text: L("اتاق در دو روز و در نبود ساکنان اجرا و تهویه شد.", "The room was installed and aired over two days while unoccupied.") },
      ],
      outcome: L(
        "اتاق بوی چاپ نمی‌دهد و پترن در نور کم شبانه آرام و خوانا می‌ماند.",
        "The room carries no print smell, and the pattern stays calm and legible in dim night light.",
      ),
      outcomeMetrics: [
        { label: L("مساحت", "Area"), value: "۱۴ m²" },
        { label: L("اجرا", "Install"), value: "۲ " + "روز" },
        { label: L("PVC", "PVC"), value: "۰" },
      ],
      tools: ["Watercolour", "Illustrator", "PVC-free non-woven"],
    },
  },
  {
    id: "portfolio-studio-minimal-office",
    slug: "studio-minimal-office",
    title: L("استودیوی مینیمال؛ دفتر معماری", "Minimal Office — Architecture Studio"),
    subtitle: L("دفتری که تقریباً سفید است", "An office that is almost white"),
    intro: L("برای یک استودیوی معماری، شبکه‌ی ظریف روی تنها دیوار اصلی نصب شد؛ بقیه سفید ماند.", "For an architecture studio, a fine hairline grid was applied to the single main wall — the rest stayed white."),
    story: [
      { type: "image", image: "/images/portfolios/pf-office.jpg" },
      { type: "text", text: L("کاغذ دیواری مینیمال در دفتر کار؛ نظم بصری بدون شلوغی.", "Minimal wallpaper in the workplace — visual order without noise.") },
    ],
    cover: "/images/portfolios/pf-office.jpg",
    gallery: ["/images/portfolios/pf-office.jpg", "/images/patterns/p06.jpg"],
    artistId: "artist-arman-kian", patternIds: ["pattern-hairline-grid"], productIds: [],
    client: L("خصوصی", "Private"), location: L("تهران", "Tehran"), year: 2025,
    scope: L("کاغذ دیواری", "Wallpaper"),
    categoryId: "cat-minimal", featured: false, isProject: true, size: "square",
    caseStudy: {
      problem: L(
        "استودیو تقریباً تمام‌سفید است و تنها یک دیوار می‌توانست بافت بگیرد، بدون آنکه فضای کار سنگین شود.",
        "The studio is almost entirely white; exactly one wall could take texture without weighing the workplace down.",
      ),
      process: [
        { title: L("شبکه‌ی مویی", "Hairline grid"), text: L("شبکه‌ای با فاصله‌ی ۱۶ سانتی‌متر و ضخامت خط ۰٫۳ میلی‌متر طراحی شد تا از سه متری محو و از نیم‌متری دقیق باشد.", "A 16 cm grid with 0.3 mm lines was drawn to disappear from three metres and stay precise at fifty centimetres.") },
        { title: L("تنظیم سفیدی", "White tuning"), text: L("سفید پترن با سفید دیوار همراستا شد تا مرز پانل دیده نشود.", "The pattern white was matched to the wall white so the panel edges disappear.") },
        { title: L("بازبینی در نور کاری", "Work-light review"), text: L("پانل در نور ۴۰۰۰ کلوین دفتر بازبینی شد، نه در نور گالری.", "The panel was reviewed under the office's 4000 K light, not gallery lighting.") },
      ],
      outcome: L(
        "دیوار از فاصله ساختار و از نزدیک جزئیات دارد؛ تمرکز بصری فضا حفظ شد.",
        "The wall has structure at distance and detail up close, and the room's visual focus is preserved.",
      ),
      outcomeMetrics: [
        { label: L("شبکه", "Grid"), value: "۱۶ cm" },
        { label: L("دیوار", "Walls"), value: "۱" },
        { label: L("اجرا", "Install"), value: "۱ " + "روز" },
      ],
      tools: ["Illustrator", "Colour proofing", "Minimal matte paper"],
    },
  },
  RAZIEH_TEXTILE_PORTFOLIO,
];

/* ------------------------------------------------------------------ */
/* Education                                                            */
/* ------------------------------------------------------------------ */
const body = (fa: string, en: string) => L(fa, en);
export const education: EducationItem[] = [
  { id: "edu-pattern-design-foundations", slug: "pattern-design-foundations", type: "course", title: L("مبانی طراحی پترن", "Pattern Design Foundations"), excerpt: L("از موتیف تا تکرار بی‌درز؛ برای کاغذدیواری، پارچه و پرده.", "From motif to seamless repeat — for wallpaper, fabric and curtains."), body: body("در این دوره یاد می‌گیرید چطور یک موتیف را طراحی، پالت را انتخاب و تکرار بی‌درز بسازید. هر درس با تمرین عملی همراه است.\n\nفصل اول به مشاهده و اسکیس می‌پردازد. فصل دوم به ساختار تکرار: بلوک، نیم‌افت و آجری. فصل سوم درباره‌ی رنگ و مقیاس برای کاغذ دیواری و پارچه است.", "In this course you learn to design a motif, choose a palette and build a seamless repeat. Every lesson comes with a practical exercise.\n\nChapter one covers observation and sketching. Chapter two covers repeat structures: block, half-drop and brick. Chapter three covers colour and scale for wallpaper and textile."), image: "/images/education/e01.jpg", authorId: "artist-razieh-khairipour", difficulty: "beginner", durationMin: 420, lessons: 18, price: { fa: 980000, en: 29 }, lessonList: [ { id: "l01", title: L("معرفی دوره و ابزارها", "Course intro & tools"), durationMin: 12, free: true }, { id: "l02", title: L("مشاهده و اسکیس اولیه", "Observation & first sketch"), durationMin: 22, free: true }, { id: "l03", title: L("ساده‌سازی موتیف", "Simplifying the motif"), durationMin: 28 }, { id: "l04", title: L("تکرار بلوک", "Block repeat"), durationMin: 24 }, { id: "l05", title: L("تکرار نیم‌افت", "Half-drop repeat"), durationMin: 26 }, { id: "l06", title: L("تکرار آجری", "Brick repeat"), durationMin: 24 }, { id: "l07", title: L("انتخاب پالت رنگی", "Choosing a colour palette"), durationMin: 30 }, { id: "l08", title: L("مقیاس برای کاغذدیواری", "Scale for wallpaper"), durationMin: 22 }, { id: "l09", title: L("مقیاس برای پارچه", "Scale for fabric"), durationMin: 20 }, { id: "l10", title: L("تبدیل به فایل دیجیتال", "Converting to digital file"), durationMin: 35 }, { id: "l11", title: L("تمیزکاری و اسکن", "Clean-up & scanning"), durationMin: 28 }, { id: "l12", title: L("رنگ‌بندی جدید (کالروِی)", "New colourway"), durationMin: 30 }, { id: "l13", title: L("آماده‌سازی فایل چاپ", "Preparing print file"), durationMin: 25 }, { id: "l14", title: L("خروجی AI و PDF", "Exporting AI & PDF"), durationMin: 18 }, { id: "l15", title: L("ارائه به مشتری", "Presenting to a client"), durationMin: 20 }, { id: "l16", title: L("لایسنس تجاری", "Commercial licence"), durationMin: 15 }, { id: "l17", title: L("قیمت‌گذاری و فروش", "Pricing & selling"), durationMin: 18 }, { id: "l18", title: L("پروژه نهایی", "Final project"), durationMin: 45 }, ], categoryId: "cat-botanical", patternIds: ["pattern-quiet-garden", "pattern-dusty-bloom"], productIds: ["product-wallpaper-quiet-garden", "product-fabric-dusty-bloom"], featured: true, popular: true, publishedAt: "2026-06-01" },
  { id: "edu-colour-for-interiors", slug: "colour-for-interiors", type: "course", title: L("رنگ برای فضای داخلی", "Colour for Interiors"), excerpt: L("چطور پالت کاغذدیواری، پارچه و پرده را با نور فضا هماهنگ کنیم.", "How to tune wallpaper, fabric and curtain palettes to a room's light."), body: body("سارا مهر با مثال‌های واقعی توضیح می‌دهد چطور یک پالت را برای نور شمالی یا جنوبی تنظیم کند.", "Sara Mehr explains with real examples how to adjust a palette for north- or south-facing light."), image: "/images/education/e02.jpg", authorId: "artist-sara-mehr", difficulty: "intermediate", durationMin: 180, lessons: 6, price: { fa: 590000, en: 18 }, categoryId: "cat-floral", patternIds: ["pattern-dusty-bloom", "pattern-little-moons"], productIds: [], featured: false, popular: true, publishedAt: "2026-08-05", draftStatus: "published" as const },
  { id: "edu-geometry-and-rhythm", slug: "geometry-and-rhythm", type: "course", title: L("هندسه و ریتم", "Geometry & Rhythm"), excerpt: L("ساخت پترن‌های هندسی دقیق برای کاغذدیواری و پارچه مبلی.", "Building precise geometric patterns for wallpaper and upholstery fabric."), body: body("آرمان کیان روش کارش با شبکه‌های شش‌ضلعی و تقارن‌های ۱۷گانه را آموزش می‌دهد.", "Arman Kian teaches his method with hexagonal grids and the 17 wallpaper symmetry groups."), image: "/images/education/e03.jpg", authorId: "artist-arman-kian", difficulty: "advanced", durationMin: 300, lessons: 12, categoryId: "cat-geometric", patternIds: ["pattern-arc-lattice", "pattern-hairline-grid"], productIds: ["product-fabric-arc-lattice", "product-wallpaper-copper-damask"], featured: true, popular: false, publishedAt: "2026-05-20" },
  { id: "edu-persian-ornament-course", slug: "persian-ornament-course", type: "course", title: L("نقش ایرانی: اسلیمی و ختایی", "Persian Ornament: Eslimi & Khatai"), excerpt: L("یادگیری سه خانواده اصلی نقش ایرانی برای طراحی معاصر.", "Learning the three main families of Persian ornament for contemporary design."), body: body("حسین تبریزی با چهار دهه تجربه، اسلیمی، ختایی و بته‌جقه را آموزش می‌دهد.", "Hossein Tabrizi with four decades of experience teaches eslimi, khatai and boteh."), image: "/images/education/e04.jpg", authorId: "artist-hossein-tabrizi", difficulty: "intermediate", durationMin: 360, lessons: 14, price: { fa: 890000, en: 27 }, categoryId: "cat-persian", patternIds: ["pattern-lapis-eslimi"], productIds: [], featured: false, popular: true, publishedAt: "2026-04-02", draftStatus: "published" as const },

  /* ── ورکشاپ آنلاین ── */
  {
    id: "edu-workshop-botanical-repeat",
    slug: "workshop-botanical-repeat",
    type: "workshop",
    title: L("ورکشاپ: تکرار گیاهی در Illustrator", "Workshop: Botanical Repeat in Illustrator"),
    excerpt: L("یک جلسه ۲ ساعته زنده با راضیه خیری پور — از اسکچ تا پترن آماده چاپ.", "A 2-hour live session with Razieh Khairipour — from sketch to print-ready pattern."),
    body: body(
      "در این ورکشاپ زنده، راضیه خیری پور گام‌به‌گام یک پترن گیاهی را در Adobe Illustrator می‌سازد. شرکت‌کنندگان می‌توانند سؤال بپرسند و فایل‌ها را بعد از جلسه دریافت کنند.",
      "In this live workshop, Razieh Khairipour builds a botanical pattern step-by-step in Adobe Illustrator. Participants can ask questions and receive files after the session."
    ),
    image: "/images/education/e01.jpg",
    authorId: "artist-razieh-khairipour",
    difficulty: "intermediate",
    durationMin: 120,
    lessons: 1,
    price: { fa: 450000, en: 14 },
    categoryId: "cat-botanical",
    patternIds: ["pattern-quiet-garden"],
    productIds: [],
    featured: true,
    popular: true,
    publishedAt: "2026-09-10",
    liveEvent: {
      isOnline: true,
      startsAt: "2026-09-20T17:00:00.000Z",
      durationMin: 120,
      capacity: 30,
      registeredCount: 24,
      status: "ended",
      certificateEnabled: false,
      recordingDownloadable: false,
      recordingPublic: false,
      hostName: L("راضیه خیری پور", "Razieh Khairipour"),
      hostNameCustom: true,
    } satisfies LiveEventConfig,
  },

  /* ── وبینار ── */
  {
    id: "edu-webinar-market-trends-2026",
    slug: "webinar-market-trends-2026",
    type: "webinar",
    title: L("وبینار: ترندهای بازار کاغذدیواری ۲۰۲۶", "Webinar: Wallpaper Market Trends 2026"),
    excerpt: L("بررسی ترندهای رنگ، پترن و متریال برای سال آینده با کارشناسان صنعت.", "An expert panel reviewing colour, pattern and material trends for the coming year."),
    body: body(
      "این وبینار رایگان با حضور سه متخصص صنعت، آخرین گزارش‌های بازار جهانی کاغذدیواری را بررسی می‌کند و پیش‌بینی‌هایی برای ۲۰۲۶ ارائه می‌دهد.",
      "This free webinar features three industry specialists reviewing the latest global wallpaper market reports and offering predictions for 2026."
    ),
    image: "/images/education/e03.jpg",
    authorId: "artist-razieh-khairipour",
    difficulty: "beginner",
    durationMin: 90,
    lessons: 1,
    price: undefined,
    categoryId: "cat-contemporary",
    patternIds: [],
    productIds: [],
    featured: false,
    popular: true,
    publishedAt: "2026-09-15",
    liveEvent: {
      isOnline: true,
      startsAt: "2026-09-25T15:00:00.000Z",
      durationMin: 90,
      capacity: 200,
      registeredCount: 87,
      status: "ended",
      certificateEnabled: false,
      recordingDownloadable: false,
      recordingPublic: false,
      hostName: L("راضیه خیری پور", "Razieh Khairipour"),
      hostNameCustom: true,
      webinarStream: {
        source: "camera",
        chatEnabled: true,
        qaEnabled: true,
        maxViewers: 200,
      },
    } satisfies LiveEventConfig,
  },
];

export const stories: Story[] = [
  { id: "story-niloufar-rad-morning-light", slug: "niloufar-rad-morning-light", artistId: "artist-niloufar-rad", title: L("نور صبح در استودیوی نیلوفر", "Morning light in Niloufar's studio"), excerpt: L("از یک برگ تا کاغذدیواری؛ درباره‌ی گواش، صبر و چاپ روی سطح.", "From one leaf to wallpaper — on gouache, patience and printing on surface."), body: L("«من همیشه با یک برگ شروع می‌کنم…»", '"I always begin with a single leaf\u2026"'), image: "/images/artists/cover-niloufar.jpg", publishedAt: "2026-07-01" },
  { id: "story-hossein-tabrizi-forty-years", slug: "hossein-tabrizi-forty-years", artistId: "artist-hossein-tabrizi", title: L("چهل سال با نقش", "Forty years with ornament"), excerpt: L("از کارگاه کاشی تا کاغذدیواری و دکور معاصر.", "From the tile workshop to contemporary wallpaper and décor."), body: L("«نقش زبان است؛ فقط باید امروز حرفش را بزنی.»", '"Ornament is a language; you just have to speak it today."'), image: "/images/artists/cover-hossein.jpg", publishedAt: "2026-06-12" },
  { id: "story-sara-mehr-small-stories", slug: "sara-mehr-small-stories", artistId: "artist-sara-mehr", title: L("داستان‌های کوچک سارا", "Sara's small stories"), excerpt: L("چطور پارچه و کاغذدیواری کودک می‌تواند یک کتاب تصویری باشد.", "How kids' fabric and wallpaper can become a picture book."), body: L("«پترن کودک باید مثل لالایی باشد.»", '"A kids\' pattern should feel like a lullaby."'), image: "/images/artists/cover-sara.jpg", publishedAt: "2026-05-22" },
];

export const collections: Collection[] = [
  { id: "col-atelier-exclusive", slug: "atelier-exclusive", title: L("کالکشن اختصاصی آتلیه", "Atelier Exclusive"), description: L("کاغذدیواری، پرده و دکور طراحی‌شده توسط آتلیه رزی.", "Wallpaper, curtains and décor designed by Rosie Atelier."), cover: "/images/products/curtain-linen.jpg", patternIds: ["pattern-torn-paper", "pattern-hairline-grid", "pattern-quiet-garden"], productIds: ["product-curtain-quiet-garden", "product-decor-cushion-set", "product-decor-atelier-lamp", "product-wallpaper-quiet-garden"] },
  { id: "col-quiet-interiors", slug: "quiet-interiors", title: L("فضاهای آرام", "Quiet Interiors"), description: L("کاغذدیواری گیاهی، پارچه نرم و پرده‌ی روشن برای خانه‌های آرام.", "Botanical wallpaper, soft fabric and light curtains for calm homes."), cover: "/images/products/wallpaper-botanical.jpg", patternIds: ["pattern-quiet-garden", "pattern-hairline-grid", "pattern-dusty-bloom"], productIds: ["product-wallpaper-quiet-garden", "product-fabric-dusty-bloom", "product-curtain-quiet-garden"] },
  { id: "col-evening-spaces", slug: "evening-spaces", title: L("فضاهای شبانه", "Evening Spaces"), description: L("کاغذدیواری لوکس، پرده مخمل و دکور با عمق فلزی.", "Luxury wallpaper, velvet curtains and décor with metallic depth."), cover: "/images/products/wallpaper-damask.jpg", patternIds: ["pattern-copper-damask", "pattern-arc-lattice", "pattern-lapis-eslimi"], productIds: ["product-wallpaper-copper-damask", "product-curtain-copper-damask", "product-decor-atelier-lamp", "product-wallpaper-lapis-eslimi"] },
];

export const homeSections: HomeSection[] = [
  "hero", "discovery", "trending", "bestSellers", "newPatterns", "artists", "portfolios", "styles", "spaces", "exclusive", "projects", "education", "b2b", "custom", "stories", "newsletter",
].map((key, i) => ({ key: key as HomeSection["key"], enabled: true, order: i + 1 }));

export const banners: Banner[] = [
  { id: "banner-free-shipping", title: L("ارسال رایگان", "Free shipping"), text: L("برای سفارش‌های کالکشن اختصاصی بالای ۲ میلیون تومان", "On exclusive collection orders over $120"), href: "/shop", enabled: true, placement: "shop" },
];

export const announcementBars: AnnouncementBarConfig[] = [
  {
    id: "ab-live-webinar",
    kind: "live-webinar",
    enabled: false,
    message: L("وبینار زنده!", "Live now!"),
    href: "",
    ctaLabel: L("ورود به رویداد", "Join now"),
    bgColor: "#dc2626",
    textColor: "#ffffff",
    transition: "slide-down",
  },
  {
    id: "ab-webinar",
    kind: "webinar",
    enabled: false,
    message: L("وبینار طراحی پترن — همین حالا ثبت‌نام کنید!", "Pattern design webinar — register now!"),
    href: "/academy",
    ctaLabel: L("ثبت‌نام", "Register"),
    bgColor: "#1a1a2e",
    textColor: "#ffffff",
    transition: "slide-down",
  },
  {
    id: "ab-sale",
    kind: "sale",
    enabled: false,
    message: L("حراجی ویژه — تا ۴۰٪ تخفیف روی همه محصولات!", "Special sale — up to 40% off all products!"),
    href: "/shop",
    ctaLabel: L("مشاهده تخفیف‌ها", "Shop sale"),
    bgColor: "#b91c1c",
    textColor: "#ffffff",
    transition: "slide-down",
  },
  {
    id: "ab-custom",
    kind: "custom",
    enabled: false,
    message: L("پیام سفارشی خود را اینجا بنویسید.", "Write your custom message here."),
    href: "/",
    ctaLabel: L("بیشتر بدانید", "Learn more"),
    bgColor: "#1e2230",
    textColor: "#ffffff",
    transition: "fade",
  },
];

export const seo: SeoMeta[] = [
  { path: "/", title: L("آتلیه رزی — پترن، کاغذدیواری، پارچه و دکور", "Rosie Atelier — Pattern, Wallpaper, Fabric & Décor"), description: L("پترن‌های اورجینال برای کاغذدیواری، طراحی پارچه، پرده و دکور — با طراحان مستقل.", "Original patterns for wallpaper, fabric design, curtains and décor — with independent designers.") },
  { path: "/patterns", title: L("پترن‌ها — آتلیه رزی", "Patterns — Rosie Atelier"), description: L("کتابخانه‌ی پترن‌های اورجینال با لایسنس تجاری برای سطح و فضا.", "A library of original patterns with commercial licenses for surface and space.") },
  { path: "/shop", title: L("فروشگاه — کاغذدیواری، پارچه، پرده، دکور", "Shop — Wallpaper, Fabric, Curtains, Décor"), description: L("کاغذدیواری، طراحی پارچه، پرده و اشیاء دکور با پترن‌های آتلیه رزی.", "Wallpaper, fabric design, curtains and décor objects with Rosie Atelier patterns.") },
  { path: "/portfolio", title: L("پورتفولیو — آتلیه رزی", "Portfolio — Rosie Atelier"), description: L("پروژه‌های اجراشده: کاغذدیواری، پرده و دکور در فضاهای واقعی.", "Realised projects: wallpaper, curtains and décor in real spaces.") },
  { path: "/academy", title: L("آکادمی — آتلیه رزی", "Academy — Rosie Atelier"), description: L("آموزش طراحی پترن از مبانی تا کاغذدیواری و پارچه.", "Pattern design education from foundations to wallpaper and textile.") },
];

