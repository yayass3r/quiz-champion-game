// ===== Question Bank - بنك الأسئلة الشامل =====

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: QuestionCategory;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  hint: string;
  funFact: string;
  points: number;
  timeLimit: number; // seconds
}

export type QuestionCategory =
  | 'science'
  | 'history'
  | 'sports'
  | 'geography'
  | 'art'
  | 'technology'
  | 'religion'
  | 'general'
  | 'literature'
  | 'math';

export const categoryInfo: Record<QuestionCategory, { name: string; icon: string; color: string; gradient: string }> = {
  science: { name: 'العلوم', icon: '🔬', color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
  history: { name: 'التاريخ', icon: '📜', color: '#f59e0b', gradient: 'from-amber-500 to-orange-600' },
  sports: { name: 'الرياضة', icon: '⚽', color: '#ef4444', gradient: 'from-red-500 to-rose-600' },
  geography: { name: 'الجغرافيا', icon: '🌍', color: '#3b82f6', gradient: 'from-blue-500 to-cyan-600' },
  art: { name: 'الفنون', icon: '🎨', color: '#a855f7', gradient: 'from-purple-500 to-violet-600' },
  technology: { name: 'التكنولوجيا', icon: '💻', color: '#6366f1', gradient: 'from-indigo-500 to-blue-600' },
  religion: { name: 'الدين', icon: '🕌', color: '#14b8a6', gradient: 'from-teal-500 to-emerald-600' },
  general: { name: 'ثقافة عامة', icon: '🧠', color: '#f97316', gradient: 'from-orange-500 to-amber-600' },
  literature: { name: 'الأدب', icon: '📚', color: '#ec4899', gradient: 'from-pink-500 to-rose-600' },
  math: { name: 'الرياضيات', icon: '🔢', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
};

export const questions: Question[] = [
  // ===== العلوم =====
  { id: 'sci1', text: 'ما هو العنصر الكيميائي الأكثر وفرة في الكون؟', options: ['الأكسجين', 'الهيدروجين', 'الهيليوم', 'الكربون'], correctIndex: 1, category: 'science', difficulty: 'easy', hint: 'هو أخف العناصر وأبسطها', funFact: 'يشكل الهيدروجين حوالي 75% من المادة العادية في الكون!', points: 100, timeLimit: 20 },
  { id: 'sci2', text: 'كم عدد كروموسومات الإنسان؟', options: ['23', '44', '46', '48'], correctIndex: 2, category: 'science', difficulty: 'easy', hint: 'عدد زوجي أكبر من 40', funFact: 'الشمبانزي لديه 48 كروموسوم، أي أكثر من الإنسان بـ 2!', points: 100, timeLimit: 15 },
  { id: 'sci3', text: 'ما هو أكبر كوكب في المجموعة الشمسية؟', options: ['زحل', 'المشتري', 'أورانوس', 'نبتون'], correctIndex: 1, category: 'science', difficulty: 'easy', hint: 'سُمي على اسم ملك الآلهة الروماني', funFact: 'المشتري أكبر من أن يتسع لأكثر من 1300 كرة أرضية بداخله!', points: 100, timeLimit: 15 },
  { id: 'sci4', text: 'ما هي الوحدة الأساسية للحياة؟', options: ['الذرة', 'الجزيء', 'الخلية', 'النسيج'], correctIndex: 2, category: 'science', difficulty: 'easy', hint: 'كل الكائنات الحية تتكون منها', funFact: 'جسم الإنسان يحتوي على حوالي 37 تريليون خلية!', points: 100, timeLimit: 15 },
  { id: 'sci5', text: 'ما هو الغاز الذي تمتصه النباتات من الجو؟', options: ['الأكسجين', 'النيتروجين', 'ثاني أكسيد الكربون', 'الهيدروجين'], correctIndex: 2, category: 'science', difficulty: 'easy', hint: 'تستخدمه النباتات في عملية البناء الضوئي', funFact: 'شجرة واحدة يمكنها امتصاص حوالي 22 كجم من CO2 سنوياً!', points: 100, timeLimit: 15 },
  { id: 'sci6', text: 'ما هي سرعة الضوء التقريبية؟', options: ['300,000 كم/ث', '150,000 كم/ث', '500,000 كم/ث', '1,000,000 كم/ث'], correctIndex: 0, category: 'science', difficulty: 'medium', hint: 'تقريباً 300 ألف كيلومتر في الثانية', funFact: 'الضوء من الشمس يستغرق حوالي 8 دقائق و20 ثانية للوصول للأرض!', points: 150, timeLimit: 20 },
  { id: 'sci7', text: 'ما هو المعدن السائل في درجة حرارة الغرفة؟', options: ['الرصاص', 'الزئبق', 'الألمنيوم', 'النحاس'], correctIndex: 1, category: 'science', difficulty: 'medium', hint: 'كان يُستخدم في ميزان الحرارة القديم', funFact: 'الزئبق هو المعدن الوحيد السائل في درجة حرارة الغرفة!', points: 150, timeLimit: 20 },
  { id: 'sci8', text: 'ما هو الحمض النووي الذي يحمل المعلومات الوراثية؟', options: ['RNA', 'DNA', 'ATP', 'ADP'], correctIndex: 1, category: 'science', difficulty: 'medium', hint: 'له شكل حلزوني مزدوج', funFact: 'لو تم فرد الحمض النووي لشخص واحد، سيصل إلى الشمس والعودة 600 مرة!', points: 150, timeLimit: 20 },
  { id: 'sci9', text: 'ما هي أصغر جسيمات المادة التي تحتفظ بخصائص العنصر؟', options: ['الجزيء', 'الذرة', 'الإلكترون', 'البروتون'], correctIndex: 1, category: 'science', difficulty: 'medium', hint: 'هي اللبنة الأساسية للمادة', funFact: 'ذرة واحدة أكبر من نواتها بمليون مرة، أي بنفس نسبة حجم الشمس للأرض!', points: 150, timeLimit: 20 },
  { id: 'sci10', text: 'ما هو القانون: لكل فعل رد فعل مساوٍ ومعاكس؟', options: ['قانون نيوتن الأول', 'قانون نيوتن الثاني', 'قانون نيوتن الثالث', 'قانون الجاذبية'], correctIndex: 2, category: 'science', difficulty: 'medium', hint: 'القانون الثالث لنيوتن', funFact: 'نيوتن اكتشف الجاذبية عندما سقطت تفاحة على رأسه حسب الأسطورة!', points: 150, timeLimit: 20 },

  // ===== التاريخ =====
  { id: 'his1', text: 'في أي عام فُتحت القسطنطينية على يد محمد الفاتح؟', options: ['1453', '1492', '1517', '1421'], correctIndex: 0, category: 'history', difficulty: 'medium', hint: 'في القرن الخامس عشر الميلادي', funFact: 'محمد الفاتح كان عمره 21 عاماً فقط عند فتح القسطنطينية!', points: 150, timeLimit: 20 },
  { id: 'his2', text: 'من هو مؤسس الدولة الأموية؟', options: ['عمر بن عبد العزيز', 'معاوية بن أبي سفيان', 'عبد الملك بن مروان', 'يزيد بن معاوية'], correctIndex: 1, category: 'history', difficulty: 'medium', hint: 'كان والياً على الشام قبل الخلافة', funFact: 'الدولة الأموية امتدت من الأندلس غرباً إلى حدود الصين شرقاً!', points: 150, timeLimit: 20 },
  { id: 'his3', text: 'في أي عام وقعت غزوة بدر؟', options: ['1 هـ', '2 هـ', '3 هـ', '4 هـ'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'في السنة الثانية للهجرة', funFact: 'كان عدد المسلمين في بدر 313 مقابل 1000 من المشركين!', points: 100, timeLimit: 15 },
  { id: 'his4', text: 'من بنى الأهرامات في مصر؟', options: ['الرومان', 'الفراعنة', 'الإغريق', 'الفينيقيون'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'حضارة نشأت على ضفاف النيل', funFact: 'الهرم الأكبر استغرق بناؤه حوالي 20 عاماً واستخدم أكثر من 2 مليون حجر!', points: 100, timeLimit: 15 },
  { id: 'his5', text: 'ما هو أطول جدار بناه الإنسان؟', options: ['جدار برلين', 'سور الصين العظيم', 'جدار هادريان', 'سور بابل'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'يقع في آسيا', funFact: 'سور الصين العظيم يمتد لأكثر من 21,000 كيلومتر!', points: 100, timeLimit: 15 },
  { id: 'his6', text: 'في أي عام بدأت الحرب العالمية الأولى؟', options: ['1912', '1914', '1916', '1918'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'في العقد الثاني من القرن العشرين', funFact: 'الحرب العالمية الأولى أودت بحياة أكثر من 17 مليون شخص!', points: 100, timeLimit: 15 },
  { id: 'his7', text: 'من هو القائد المسلم الذي فتح بلاد السند؟', options: ['طارق بن زياد', 'محمد بن القاسم الثقفي', 'قتيبة بن مسلم', 'موسى بن نصير'], correctIndex: 1, category: 'history', difficulty: 'hard', hint: 'كان عمره 17 عاماً فقط', funFact: 'محمد بن القاسم فتح السند وعمره 17 عاماً فقط، وهو أصغر قائد عسكري في التاريخ الإسلامي!', points: 200, timeLimit: 25 },
  { id: 'his8', text: 'ما هي أقدم حضارة معروفة في التاريخ؟', options: ['الحضارة المصرية', 'حضارة السند', 'الحضارة السومرية', 'الحضارة الصينية'], correctIndex: 2, category: 'history', difficulty: 'hard', hint: 'نشأت في بلاد الرافدين', funFact: 'السومريون اخترعوا الكتابة قبل أكثر من 5000 عام!', points: 200, timeLimit: 25 },

  // ===== الرياضة =====
  { id: 'spo1', text: 'كم عدد لاعبي فريق كرة القدم؟', options: ['9', '10', '11', '12'], correctIndex: 2, category: 'sports', difficulty: 'easy', hint: 'أكثر من 10 وأقل من 12', funFact: 'كرة القدم هي الرياضة الأكثر شعبية في العالم مع أكثر من 4 مليار متابع!', points: 100, timeLimit: 10 },
  { id: 'spo2', text: 'في أي دولة أقيمت كأس العالم 2022؟', options: ['البرازيل', 'روسيا', 'قطر', 'الأرجنتين'], correctIndex: 2, category: 'sports', difficulty: 'easy', hint: 'أول دولة عربية تستضيف كأس العالم', funFact: 'قطر هي أصغر دولة تستضيف كأس العالم على الإطلاق!', points: 100, timeLimit: 15 },
  { id: 'spo3', text: 'من هو هداف كأس العالم 2022؟', options: ['ليونيل ميسي', 'كيليان مبابي', 'أوليفيه جيرو', 'جوليان ألفاريز'], correctIndex: 1, category: 'sports', difficulty: 'medium', hint: 'لاعب فرنسي سجل هاتريك في النهائي', funFact: 'مبابي سجل هاتريك في نهائي كأس العالم وهو ثاني لاعب يفعل ذلك بعد جيف هيرست عام 1966!', points: 150, timeLimit: 20 },
  { id: 'spo4', text: 'كم مرة فازت البرازيل بكأس العالم؟', options: ['3', '4', '5', '6'], correctIndex: 2, category: 'sports', difficulty: 'medium', hint: 'أكثر منتخب تحقيقاً للقب', funFact: 'البرازيل هي الدولة الوحيدة التي شاركت في كل نسخ كأس العالم!', points: 150, timeLimit: 20 },
  { id: 'spo5', text: 'ما هي رياضة "سيد الملاكم" محمد علي كلاي؟', options: ['المصارعة', 'الكاراتيه', 'الملاكمة', 'التايكوندو'], correctIndex: 2, category: 'sports', difficulty: 'easy', hint: 'رياضة تعتمد على اللكمات', funFact: 'محمد علي كلاي فاز بذهبية أولمبية عام 1960 وكان عمره 18 عاماً!', points: 100, timeLimit: 15 },
  { id: 'spo6', text: 'ما طول مسبح السباحة الأولمبي؟', options: ['25 متر', '50 متر', '100 متر', '75 متر'], correctIndex: 1, category: 'sports', difficulty: 'medium', hint: 'نصف مساحة ملعب كرة القدم تقريباً', funFact: 'مايكل فيلبس هو أكثر رياضي أولمبي حصولاً على الميداليات بـ 28 ميدالية!', points: 150, timeLimit: 20 },

  // ===== الجغرافيا =====
  { id: 'geo1', text: 'ما هي أكبر قارة في العالم من حيث المساحة؟', options: ['أفريقيا', 'أمريكا الشمالية', 'آسيا', 'أوروبا'], correctIndex: 2, category: 'geography', difficulty: 'easy', hint: 'تضم أكبر عدد من السكان أيضاً', funFact: 'آسيا تبلغ مساحتها حوالي 44.5 مليون كم مربع، أي 30% من مساحة اليابسة!', points: 100, timeLimit: 15 },
  { id: 'geo2', text: 'ما هو أطول نهر في العالم؟', options: ['الأمازون', 'النيل', 'المسيسيبي', 'اليانغتسي'], correctIndex: 1, category: 'geography', difficulty: 'easy', hint: 'يمر بعدة دول أفريقية', funFact: 'نهر النيل يمتد لمسافة 6,650 كم ويمر عبر 11 دولة أفريقية!', points: 100, timeLimit: 15 },
  { id: 'geo3', text: 'ما هي عاصمة اليابان؟', options: ['أوساكا', 'كيوتو', 'طوكيو', 'هيروشيما'], correctIndex: 2, category: 'geography', difficulty: 'easy', hint: 'أكبر مدينة في اليابان', funFact: 'طوكيو هي أكبر منطقة حضرية في العالم بأكثر من 37 مليون نسمة!', points: 100, timeLimit: 15 },
  { id: 'geo4', text: 'ما هو أعلى جبل في العالم؟', options: ['كي 2', 'إفرست', 'كلمنجارو', 'مون بلان'], correctIndex: 1, category: 'geography', difficulty: 'easy', hint: 'يقع على حدود نيبال والتبت', funFact: 'ارتفاع إفرست 8,849 متر، وهو يزداد ارتفاعاً بمقدار 4 مم سنوياً!', points: 100, timeLimit: 15 },
  { id: 'geo5', text: 'كم عدد دول قارة أفريقيا؟', options: ['48', '52', '54', '56'], correctIndex: 2, category: 'geography', difficulty: 'medium', hint: 'أكثر من 50 دولة', funFact: 'أفريقيا هي ثاني أكبر قارة وتضم أكبر عدد من الدول في العالم!', points: 150, timeLimit: 20 },
  { id: 'geo6', text: 'ما هي أكبر صحراء في العالم؟', options: ['صحراء الربع الخالي', 'الصحراء الكبرى', 'صحراء جوبي', 'صحراء القطب الجنوبي'], correctIndex: 3, category: 'geography', difficulty: 'hard', hint: 'ليست في أفريقيا!', funFact: 'صحراء القطب الجنوبي هي أكبر صحراء بمساحة 14 مليون كم مربع، بينما الصحراء الكبرى 9.2 مليون!', points: 200, timeLimit: 25 },

  // ===== الفنون =====
  { id: 'art1', text: 'من رسم لوحة الموناليزا؟', options: ['مايكل أنجلو', 'ليوناردو دا فينشي', 'رافائيل', 'بيكاسو'], correctIndex: 1, category: 'art', difficulty: 'easy', hint: 'فنان وعالم إيطالي شهير', funFact: 'الموناليزا ليس لها حاجبان! كان ذلك أسلوباً شائعاً في فلورنسا آنذاك!', points: 100, timeLimit: 15 },
  { id: 'art2', text: 'ما هي أداة العزف التي تحتوي على 88 مفتاحاً؟', options: ['الأورغ', 'البيانو', 'الأكورديون', 'السynth'], correctIndex: 1, category: 'art', difficulty: 'easy', hint: 'آلة موسيقية كلاسيكية كبيرة', funFact: 'البيانو يحتوي على حوالي 230 وتراً ومفتاحه الأثقل يتحمل ضغط حوالي 20 طن!', points: 100, timeLimit: 15 },
  { id: 'art3', text: 'ما هو النمط الفني الذي اشتهر به بابلو بيكاسو؟', options: ['الانطباعية', 'التكعيبية', 'السريالية', 'الواقعية'], correctIndex: 1, category: 'art', difficulty: 'medium', hint: 'يعتمد على الأشكال الهندسية', funFact: 'بيكاسو أنتج أكثر من 50,000 عمل فني خلال حياته!', points: 150, timeLimit: 20 },
  { id: 'art4', text: 'في أي مدينة يقع متحف اللوفر؟', options: ['لندن', 'روما', 'باريس', 'مدريد'], correctIndex: 2, category: 'art', difficulty: 'easy', hint: 'عاصمة فرنسا', funFact: 'متحف اللوفر يستقبل حوالي 10 ملايين زائر سنوياً، وهو الأكثر زيارة في العالم!', points: 100, timeLimit: 15 },

  // ===== التكنولوجيا =====
  { id: 'tec1', text: 'من أسس شركة مايكروسوفت؟', options: ['ستيف جوبز', 'بيل غيتس', 'مارك زوكربيرغ', 'جيف بيزوس'], correctIndex: 1, category: 'technology', difficulty: 'easy', hint: 'أغنى رجل في العالم لسنوات طويلة', funFact: 'بيل غيتس كتب أول برنامج له عندما كان في الثالثة عشرة من عمره!', points: 100, timeLimit: 15 },
  { id: 'tec2', text: 'ما هي لغة البرمجة الأكثر استخداماً في الويب؟', options: ['Python', 'Java', 'JavaScript', 'C++'], correctIndex: 2, category: 'technology', difficulty: 'easy', hint: 'تعمل في المتصفح والخادم', funFact: 'JavaScript أُنشئت في 10 أيام فقط بواسطة بريندان آيك عام 1995!', points: 100, timeLimit: 15 },
  { id: 'tec3', text: 'ما هو اختصار AI؟', options: ['Auto Intelligence', 'Artificial Intelligence', 'Advanced Integration', 'Applied Information'], correctIndex: 1, category: 'technology', difficulty: 'easy', hint: 'ذكاء اصطناعي', funFact: 'مصطلح الذكاء الاصطناعي أُطلق لأول مرة عام 1956 في مؤتمر دارتموث!', points: 100, timeLimit: 15 },
  { id: 'tec4', text: 'في أي عام أُطلق أول آيفون؟', options: ['2005', '2006', '2007', '2008'], correctIndex: 2, category: 'technology', difficulty: 'medium', hint: 'في النصف الثاني من العقد الأول', funFact: 'أول آيفون كان بسعة تخزين 4 أو 8 جيجابايت فقط وبدون كاميرا أمامية!', points: 150, timeLimit: 20 },
  { id: 'tec5', text: 'ما هو بروتوكول الاتصال الذي تستخدمه الإنترنت؟', options: ['TCP/IP', 'FTP', 'HTTP', 'SMTP'], correctIndex: 0, category: 'technology', difficulty: 'medium', hint: 'البروتوكول الأساسي للإنترنت', funFact: 'TCP/IP طُور في السبعينيات على يد فينت سيرف وبوب خان!', points: 150, timeLimit: 20 },
  { id: 'tec6', text: 'ما هو مفهوم Blockchain؟', options: ['قاعدة بيانات مركزية', 'سلسلة كتل لامركزية', 'خادم سحابي', 'شبكة خاصة'], correctIndex: 1, category: 'technology', difficulty: 'medium', hint: 'التقنية وراء العملات الرقمية', funFact: 'البلوكتشين أُنشئ أصلاً عام 2008 كتقنية داعمة للبيتكوين!', points: 150, timeLimit: 20 },

  // ===== الدين =====
  { id: 'rel1', text: 'كم عدد أركان الإسلام؟', options: ['3', '4', '5', '6'], correctIndex: 2, category: 'religion', difficulty: 'easy', hint: 'عدد أصابع يد واحدة', funFact: 'أركان الإسلام الخمرة هي: الشهادتان، الصلاة، الزكاة، الصوم، والحج!', points: 100, timeLimit: 15 },
  { id: 'rel2', text: 'ما هي أطول سورة في القرآن الكريم؟', options: ['آل عمران', 'النساء', 'البقرة', 'المائدة'], correctIndex: 2, category: 'religion', difficulty: 'easy', hint: 'السورة الثانية في القرآن', funFact: 'سورة البقرة تحتوي على 286 آية وهي أطول سورة في القرآن الكريم!', points: 100, timeLimit: 15 },
  { id: 'rel3', text: 'من هو النبي الذي بنى الكعبة مع ابنه؟', options: ['نوح', 'إبراهيم', 'محمد', 'إسماعيل'], correctIndex: 1, category: 'religion', difficulty: 'easy', hint: 'أبو الأنبياء', funFact: 'إبراهيم عليه السلام بنى الكعبة مع ابنه إسماعيل، وهما يدعوان: ربنا تقبل مننا!', points: 100, timeLimit: 15 },
  { id: 'rel4', text: 'كم عدد سور القرآن الكريم؟', options: ['110', '112', '114', '116'], correctIndex: 2, category: 'religion', difficulty: 'easy', hint: 'عدد زوجي أكبر من 110', funFact: 'القرآن الكريم يحتوي على 114 سورة و6236 آية وُنزلت على مدى 23 عاماً!', points: 100, timeLimit: 15 },
  { id: 'rel5', text: 'ما هي السورة التي تسمى قلب القرآن؟', options: ['الفاتحة', 'يس', 'الرحمن', 'الملك'], correctIndex: 1, category: 'religion', difficulty: 'medium', hint: 'تبدأ بحروف مقطعة', funFact: 'سورة يس تسمى قلب القرآن وورد فيها ذكر القرآن بأربعة أسماء مختلفة!', points: 150, timeLimit: 20 },
  { id: 'rel6', text: 'كم عدد الأنبياء والرسل المذكورين في القرآن؟', options: ['20', '25', '30', '35'], correctIndex: 1, category: 'religion', difficulty: 'medium', hint: 'خمسة وعشرون', funFact: 'ذكر القرآن 25 نبياً ورسولاً، وأولهم آدم وآخرهم محمد صلى الله عليهم أجمعين!', points: 150, timeLimit: 20 },

  // ===== ثقافة عامة =====
  { id: 'gen1', text: 'ما هي اللغة الأكثر تحدثاً في العالم؟', options: ['الإنجليزية', 'الماندرين', 'الإسبانية', 'العربية'], correctIndex: 1, category: 'general', difficulty: 'medium', hint: 'لغة الدولة الأكثر سكاناً', funFact: 'الماندرين يتحدثها أكثر من مليار شخص كلغة أم!', points: 150, timeLimit: 20 },
  { id: 'gen2', text: 'كم عدد ألوان قوس قزح؟', options: ['5', '6', '7', '8'], correctIndex: 2, category: 'general', difficulty: 'easy', hint: 'أحمر، برتقالي، أصفر...', funFact: 'قوس قزح يحتوي فعلياً على ألوان لا نهائية، لكننا نميز 7 ألوان رئيسية فقط!', points: 100, timeLimit: 15 },
  { id: 'gen3', text: 'ما هو أغلى معدن في العالم؟', options: ['الذهب', 'البلاتين', 'الروديوم', 'الأوزميوم'], correctIndex: 2, category: 'general', difficulty: 'hard', hint: 'ليس الذهب أو البلاتين!', funFact: 'الروديوم أغلى من الذهب بحوالي 5 مرات ويُستخدم في المحولات الحفازة للسيارات!', points: 200, timeLimit: 25 },
  { id: 'gen4', text: 'ما هو الحيوان الأسرع على وجه الأرض؟', options: ['الأسد', 'الفهد', 'الحصان', 'الغزال'], correctIndex: 1, category: 'general', difficulty: 'easy', hint: 'يمكنه الوصول لسرعة 120 كم/ساعة', funFact: 'الفهد يمكنه التسارع من 0 إلى 100 كم/ساعة في 3 ثوانٍ فقط!', points: 100, timeLimit: 15 },
  { id: 'gen5', text: 'كم عدد أيام السنة الكبيسة؟', options: ['364', '365', '366', '367'], correctIndex: 2, category: 'general', difficulty: 'easy', hint: 'يُضاف يوم لشهر فبراير', funFact: 'السنة الكبيسة تحدث كل 4 سنوات، باستثناء السنوات التي تقبل القسمة على 100 ولا تقبل القسمة على 400!', points: 100, timeLimit: 15 },
  { id: 'gen6', text: 'ما هو البحر الذي يسمى البحر الميت؟', options: ['البحر الأحمر', 'البحر الأبيض المتوسط', 'البحر الميت', 'بحر العرب'], correctIndex: 2, category: 'general', difficulty: 'easy', hint: 'أقل بحر ملوحة وارتفاعاً', funFact: 'البحر الميت هو أخفض نقطة على سطح الأرض عند 430 متراً تحت سطح البحر!', points: 100, timeLimit: 15 },

  // ===== الأدب =====
  { id: 'lit1', text: 'من هو مؤلف رواية "ألف ليلة وليلة"؟', options: ['شخص واحد مجهول', 'مجموعة من المؤلفين عبر العصور', 'ابن خلدون', 'الجاحظ'], correctIndex: 1, category: 'literature', difficulty: 'medium', hint: 'ليس لمؤلف واحد', funFact: 'ألف ليلة وليلة هي مجموعة من القصص الشعبية جُمعت عبر قرون من حضارات مختلفة!', points: 150, timeLimit: 20 },
  { id: 'lit2', text: 'من كتب ملحمة الإلياذة؟', options: ['سوفوكليس', 'هوميروس', 'أفلاطون', 'أرسطو'], correctIndex: 1, category: 'literature', difficulty: 'medium', hint: 'شاعر يوناني أسطوري', funFact: 'هوميروس كان أعمى حسب الأسطورة، ومع ذلك ألّف أعظم ملحمتين في التاريخ!', points: 150, timeLimit: 20 },
  { id: 'lit3', text: 'من هو شاعر النيل؟', options: ['أحمد شوقي', 'حافظ إبراهيم', 'إيليا أبو ماضي', 'جبران خليل جبران'], correctIndex: 1, category: 'literature', difficulty: 'medium', hint: 'مصري لُقب بشاعر النيل', funFact: 'حافظ إبراهيم كان يُلقب بشاعر النيل وأمير الشعراء أحمد شوقي كان معاصره!', points: 150, timeLimit: 20 },
  { id: 'lit4', text: 'ما هي أقدم لغة مكتوبة في التاريخ؟', options: ['السومرية', 'المصرية القديمة', 'الصينية', 'السنسكريتية'], correctIndex: 0, category: 'literature', difficulty: 'hard', hint: 'لغة حضارة بلاد الرافدين', funFact: 'الكتابة السومرية المسمارية تعود لأكثر من 5000 عام وهي أقدم نظام كتابة معروف!', points: 200, timeLimit: 25 },

  // ===== الرياضيات =====
  { id: 'mat1', text: 'ما هو قيمة باي (π) التقريبية؟', options: ['3.14', '2.71', '1.61', '4.13'], correctIndex: 0, category: 'math', difficulty: 'easy', hint: 'نسبة محيط الدائرة إلى قطرها', funFact: 'باي عدد لا نهائي وقد حُسب لأكثر من 100 تريليون رقم عشري!', points: 100, timeLimit: 15 },
  { id: 'mat2', text: 'ما هو العدد الأولي الأصغر؟', options: ['0', '1', '2', '3'], correctIndex: 2, category: 'math', difficulty: 'medium', hint: 'هو العدد الأولي الوحيد الزوجي', funFact: '2 هو العدد الأولي الوحيد الزوجي، وجميع الأعداد الأولية الأخرى فردية!', points: 150, timeLimit: 20 },
  { id: 'mat3', text: 'كم عدد أضلاع المثلث؟', options: ['2', '3', '4', '5'], correctIndex: 1, category: 'math', difficulty: 'easy', hint: 'اسمه يدل على العدد', funFact: 'مجموع زوايا أي مثلث دائماً يساوي 180 درجة!', points: 100, timeLimit: 10 },
  { id: 'mat4', text: 'ما هو الرقم التالي في المتتالية: 1, 1, 2, 3, 5, 8, ?؟', options: ['11', '12', '13', '15'], correctIndex: 2, category: 'math', difficulty: 'medium', hint: 'كل عدد = مجموع العددين السابقين', funFact: 'متتالية فيبوناتشي تظهر في الطبيعة في الأصداف البحرية وترتيب بذور عباد الشمس!', points: 150, timeLimit: 20 },
  { id: 'mat5', text: 'ما ناتج 15 × 15؟', options: ['200', '215', '225', '250'], correctIndex: 2, category: 'math', difficulty: 'easy', hint: 'أكثر من 220', funFact: 'هناك خدعة سهلة: الأرقام المنتهية بـ 5 مربعها = الجزء الأول × (الجزء الأول + 1) ثم 25!', points: 100, timeLimit: 15 },

  // ===== Expert Level Questions =====
  { id: 'exp1', text: 'ما هو النظير المشع المستخدم في تحديد عمر الآثار؟', options: ['كربون-12', 'كربون-14', 'يورانيوم-235', 'رادون-222'], correctIndex: 1, category: 'science', difficulty: 'expert', hint: 'نظير للكربون يحتوي على 8 نيوترونات', funFact: 'كربون-14 يمكنه تحديد عمر الآثار بدقة حتى 50,000 عام!', points: 300, timeLimit: 30 },
  { id: 'exp2', text: 'من هو العالم الذي صاغ نظرية النسبية العامة؟', options: ['نيوتن', 'أينشتاين', 'هايزنبرغ', 'بور'], correctIndex: 1, category: 'science', difficulty: 'expert', hint: 'حائز على جائزة نوبل في الفيزياء', funFact: 'أينشتاين لم يحصل على نوبل لنسبية بل لتفسيره التأثير الكهروضوئي!', points: 300, timeLimit: 30 },
  { id: 'exp3', text: 'ما هي معركة يُطلق عليها "أم المعارك" في التاريخ الإسلامي؟', options: ['معركة بدر', 'معركة القادسية', 'معركة اليرموك', 'معركة حطين'], correctIndex: 2, category: 'history', difficulty: 'expert', hint: 'معركة بين المسلمين والروم', funFact: 'معركة اليرموك انتصر فيها 40 ألف مسلم على 200 ألف من الروم!', points: 300, timeLimit: 30 },
  { id: 'exp4', text: 'ما هو مفهوم "المفارقة الكمية" في الفيزياء؟', options: ['مفارقة فيرمي', 'مفارقة إهرنفست', 'مفارقة قطة شرودنغر', 'مفارقة الزمن'], correctIndex: 2, category: 'science', difficulty: 'expert', hint: 'قطة حية وميتة في نفس الوقت', funFact: 'شرودنغر صاغ هذه المفارقة لانتقاد تفسير كوبنهاغن، لا لتأييده!', points: 300, timeLimit: 30 },
];

// Get questions by category and difficulty
export function getQuestions(category?: QuestionCategory, difficulty?: string, count: number = 10): Question[] {
  let filtered = [...questions];
  if (category) filtered = filtered.filter(q => q.category === category);
  if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
  // Shuffle and return count
  return filtered.sort(() => Math.random() - 0.5).slice(0, count);
}

// Get random questions across all categories
export function getRandomQuestions(count: number = 10): Question[] {
  return [...questions].sort(() => Math.random() - 0.5).slice(0, count);
}

// Get questions for survival mode (increasing difficulty)
export function getSurvivalQuestions(count: number = 20): Question[] {
  const easy = questions.filter(q => q.difficulty === 'easy').sort(() => Math.random() - 0.5);
  const medium = questions.filter(q => q.difficulty === 'medium').sort(() => Math.random() - 0.5);
  const hard = questions.filter(q => q.difficulty === 'hard').sort(() => Math.random() - 0.5);
  const expert = questions.filter(q => q.difficulty === 'expert').sort(() => Math.random() - 0.5);
  return [...easy, ...medium, ...hard, ...expert].slice(0, count);
}
