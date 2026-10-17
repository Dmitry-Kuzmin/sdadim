/** Вопросы мини-тестов DGT в статьях (компонент <Quiz>) */

export interface QuizQuestion {
  id: number;
  /** Текст вопроса на испанском (как в DGT) */
  question_es: string;
  /** Перевод вопроса на русский */
  question_ru: string;
  /** Картинка к вопросу (опционально) */
  image?: string;
  /** 3 варианта ответа */
  options: string[];
  /** Индекс правильного ответа (0, 1 или 2) */
  correct: number;
  /** Разбор на русском: почему именно этот ответ */
  explanation: string;
  /** Ключевой принцип DGT для этого вопроса */
  principle?: string;
}

export const ECO_DRIVING_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question_es: "Circular en punto muerto cuesta abajo, con el motor en marcha, respecto a circular con una marcha engranada y el pie levantado del acelerador...",
    question_ru: "Езда на нейтральной передаче под гору с работающим двигателем, по сравнению с ездой на включённой передаче с убранной ногой с газа...",
    options: [
      "...supone un mayor consumo de combustible.",
      "...supone el mismo consumo de combustible.",
      "...supone un menor consumo de combustible.",
    ],
    correct: 0,
    explanation: "На нейтральной передаче двигатель потребляет топливо на поддержание холостого хода (~0,5–1 л/ч). При включённой передаче и убранной ноге с газа электроника полностью закрывает форсунки — расход топлива равен НУЛЮ. Это называется «engine braking» (торможение двигателем). Таким образом, нейтраль под гору обходится ДОРОЖЕ, а не дешевле.",
    principle: "При движении в натяг (включённая передача, нога убрана с газа) — расход = 0. Нейтраль = холостой ход = расход топлива.",
  },
  {
    id: 2,
    question_es: "¿En qué afecta a la eficiencia energética del vehículo llevar los neumáticos con una presión por debajo de la recomendada por el fabricante?",
    question_ru: "Как влияет на энергоэффективность автомобиля давление в шинах ниже рекомендованного производителем?",
    options: [
      "Reduce el consumo de combustible.",
      "No afecta al consumo de combustible.",
      "Aumenta el consumo de combustible.",
    ],
    correct: 2,
    explanation: "Недостаточное давление в шинах увеличивает площадь контакта с дорогой и сопротивление качению. Автомобилю нужно больше усилий (и топлива), чтобы двигаться. При давлении на 0,5 бар ниже нормы расход топлива растёт на 5–10%. Дополнительно: снижается управляемость и увеличивается риск аквапланирования.",
    principle: "Правильное давление шин (по регламенту производителя) снижает потребление топлива до 10% — проверяй ежемесячно на холодных шинах.",
  },
  {
    id: 3,
    question_es: "Para lograr una conducción eficiente, ¿cuándo debe reducirse la velocidad antes de llegar a una curva?",
    question_ru: "Для экономичного вождения, когда следует снижать скорость перед поворотом?",
    options: [
      "Frenando con el pedal hasta la entrada a la curva.",
      "Antes de la curva, levantando el pie del acelerador.",
      "En la propia curva, usando el freno suavemente.",
    ],
    correct: 1,
    explanation: "Главный принцип eco-driving — 'чтение дороги'. Видите поворот заблаговременно → убираете ногу с газа → машина замедляется за счёт торможения двигателем без расхода топлива. Торможение педалью тормоза означает потерю кинетической энергии, которую пришлось 'купить' за топливо. Тормоз = выброшенные деньги.",
    principle: "Смотрите далеко вперёд. Реагируйте убиранием газа, а не нажатием тормоза — сохраняете энергию (и деньги).",
  },
  {
    id: 4,
    question_es: "Circular a mayor velocidad en carretera, ¿cómo afecta al consumo de combustible?",
    question_ru: "Как движение на большей скорости по шоссе влияет на расход топлива?",
    options: [
      "Lo disminuye, porque el motor trabaja menos tiempo.",
      "No varía, es indiferente la velocidad.",
      "Lo aumenta, por la mayor resistencia aerodinámica.",
    ],
    correct: 2,
    explanation: "Аэродинамическое сопротивление растёт пропорционально КВАДРАТУ скорости. При скорости 150 км/ч сопротивление воздуха в 2,25 раза больше, чем при 100 км/ч. Это напрямую увеличивает расход топлива. Пример: авто, которое потребляет 6 л/100 км при 120 км/ч, будет потреблять ~7,5 л/100 км при 150 км/ч.",
    principle: "Физика: F(сопротивление) = k × v². Скорость × 1,5 → сопротивление × 2,25 → расход значительно выше.",
  },
  {
    id: 5,
    question_es: "¿Es correcto apagar el motor del vehículo mientras circula por una pendiente descendente para ahorrar combustible?",
    question_ru: "Правильно ли выключать двигатель автомобиля во время движения под гору для экономии топлива?",
    options: [
      "Sí, porque el motor no consume combustible cuando está apagado.",
      "No, porque se pierde la asistencia a la dirección y a los frenos.",
      "Sí, pero solo en vehículos modernos con tecnología Stop&Start.",
    ],
    correct: 1,
    explanation: "Выключение двигателя во время движения — КРАЙНЕ ОПАСНО. При заглушённом двигателе отключается гидроусилитель руля (руль становится очень тяжёлым) и вакуумный усилитель тормозов (педаль тормоза становится «деревянной», а эффективность торможения резко падает). Это может привести к потере управления. Такие действия запрещены и наказываются штрафом во время экзамена DGT.",
    principle: "Никогда не глушите двигатель на ходу. При движении с включённой передачей без газа — топливо не тратится и так.",
  },
];

// ─── Пресет вопросов: ловушки теоретического экзамена ─────────────────────────

export const TRAP_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question_es: "En una glorieta, ¿quién tiene prioridad de paso?",
    question_ru: "На круговом движении — у кого приоритет?",
    options: [
      "Los vehículos que ya circulan por la glorieta.",
      "Los vehículos que quieren entrar en la glorieta.",
      "El vehículo que se aproxima por la derecha.",
    ],
    correct: 0,
    explanation: "В Испании на кольце приоритет у тех, кто уже едет по кругу: въезжающие уступают. Ловушка — привычка из правил «помеха справа», которая на кольце не работает.",
    principle: "Кто на кольце — тот главный. Въезд — уступить, выезд — только из правого ряда.",
  },
  {
    id: 2,
    question_es: "¿Cuál es la tasa máxima de alcohol en aire espirado para un conductor con menos de dos años de antigüedad del permiso?",
    question_ru: "Какой максимальный уровень алкоголя в выдыхаемом воздухе для водителя со стажем прав меньше двух лет?",
    options: ["0,25 mg/l.", "0,15 mg/l.", "0,10 mg/l."],
    correct: 1,
    explanation: "Общий лимит — 0,25 мг/л, но для новичков (первые два года) и профессиональных водителей — 0,15 мг/л. Варианты специально отличаются на «одну цифру»: числа в DGT нужно знать без запинки.",
    principle: "0,25 — все, 0,15 — новички и профессионалы. Выше 0,60 — уже уголовное дело.",
  },
  {
    id: 3,
    question_es: "Al girar para entrar en otra vía, ¿debe ceder el paso a los peatones que la cruzan?",
    question_ru: "Поворачивая на другую улицу, нужно ли уступить пешеходам, которые её переходят?",
    options: [
      "Únicamente si existe un paso para peatones señalizado.",
      "Sí, aunque no exista paso para peatones.",
      "No, porque el giro tiene prioridad.",
    ],
    correct: 1,
    explanation: "При повороте водитель уступает пешеходам, которые переходят улицу, на которую он въезжает, — даже без зебры. Слово «únicamente» («только») сужает правило и делает ответ неверным — классическая ловушка.",
    principle: "Видите «únicamente», «solo», «siempre», «nunca» — проверьте, нет ли исключений. Обычно ответ с ними неверен.",
  },
  {
    id: 4,
    question_es: "En una vía urbana con un único carril por sentido de circulación, la velocidad máxima genérica es...",
    question_ru: "В городе на улице с одной полосой в каждую сторону общий лимит скорости —",
    options: ["50 km/h.", "30 km/h.", "40 km/h."],
    correct: 1,
    explanation: "С 2021 года в испанских городах: 20 км/ч на улицах без отдельного тротуара, 30 км/ч — где одна полоса в каждую сторону, 50 км/ч — где две и больше. Многие по старой памяти отвечают 50.",
    principle: "Город: 20 / 30 / 50 — по числу полос, если знаки не говорят иное.",
  },
  {
    id: 5,
    question_es: "¿Está permitido conducir utilizando el teléfono móvil sujetándolo con la mano?",
    question_ru: "Можно ли вести машину, держа телефон в руке?",
    options: [
      "Sí, durante conversaciones cortas.",
      "Solo en vías urbanas y a baja velocidad.",
      "No, está prohibido.",
    ],
    correct: 2,
    explanation: "Держать телефон в руке за рулём запрещено в любой ситуации. Это одно из самых дорогих нарушений: 200 € и 6 баллов — у новичка с 8 баллами почти весь счёт.",
    principle: "Телефон — только в держателе и без рук.",
  },
];

/** Тема 7 «Аварии» — бесплатные вопросы банка DGT (is_premium = false) из уроков модуля 7 курса Skilyapp */
export const TEMA7_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question_es: "Se denomina distancia de reacción:",
    question_ru: "Расстоянием реакции называется:",
    options: [
      "La distancia recorrida desde que se ve un peligro hasta que se actúa sobre los mandos del vehículo.",
      "La distancia que debe dejarse entre dos vehículos cuando van circulando uno detrás del otro.",
      "La distancia recorrida desde que se comienza a frenar hasta que se detiene el vehículo.",
    ],
    correct: 0,
    explanation: "Реакция — это метры, которые машина проезжает, пока вы ещё не коснулись педали: от «увидел» до «нажал». Второй вариант — дистанция между машинами, третий — тормозной путь. Все три слова на «distancia», поэтому их и путают.",
    principle: "Reacción = до педали. Frenado = от педали до остановки. Detención = всё вместе.",
  },
  {
    id: 2,
    question_es: "La distancia de frenado de un vehículo cargado es...",
    question_ru: "Тормозной путь гружёного транспортного средства...",
    options: ["menor que cuando circula sin carga.", "igual que cuando circula sin carga.", "mayor que cuando circula sin carga."],
    correct: 2,
    explanation: "Чем тяжелее машина, тем больше энергии нужно погасить тормозам, и тормозной путь растёт. Ловушка — мысль, что груз «прижимает» машину к дороге и улучшает сцепление.",
    principle: "Больше вес — длиннее торможение.",
  },
  {
    id: 3,
    question_es: "¿Si entra en una curva a la izquierda a velocidad excesiva, la fuerza centrífuga puede afectar a la trayectoria del vehículo?",
    question_ru: "Если вы входите в левый поворот на слишком высокой скорости, может ли центробежная сила повлиять на траекторию автомобиля?",
    options: [
      "Sí, se desplazará hacia la izquierda de la calzada.",
      "Sí, se desplazará hacia la derecha de calzada.",
      "No, la fuerza centrífuga no afecta a la trayectoria del vehículo.",
    ],
    correct: 1,
    explanation: "Центробежная сила всегда выносит наружу поворота. Поворот налево — наружная сторона справа, туда машину и понесёт.",
    principle: "Наружу поворота: налево — вправо, направо — влево.",
  },
  {
    id: 4,
    question_es: "¿Cuándo empieza a bajar la cantidad de alcohol en sangre?",
    question_ru: "Когда уровень алкоголя в крови начинает снижаться?",
    options: ["Nada más dejar de beber.", "Quince minutos después de dejar de beber.", "Una hora después de dejar de beber."],
    correct: 2,
    explanation: "Первый час после последнего бокала алкоголь ещё всасывается из желудка, и уровень в крови продолжает расти. Снижаться он начинает только через час, и дальше очень медленно.",
    principle: "Алкоголь растёт быстро, а уходит часами.",
  },
  {
    id: 5,
    question_es: "Para que el apoyacabezas esté regulado correctamente, la distancia respecto a la cabeza debe ser...",
    question_ru: "Чтобы подголовник был отрегулирован правильно, расстояние до головы должно быть...",
    options: ["superior a 4 cm.", "la mínima posible y nunca superior a 4 cm.", "la que resulte más cómoda para el conductor."],
    correct: 1,
    explanation: "Чем дальше подголовник от затылка, тем сильнее голова успевает откинуться при ударе сзади — так и получается хлыстовая травма. «Как удобнее» — типичная ловушка.",
    principle: "Подголовник — вплотную, максимум 4 см, центр на уровне глаз.",
  },
  {
    id: 6,
    question_es: "¿Qué efectos tiene en la conducción una conversación por el móvil que supera el minuto y medio?",
    question_ru: "Как влияет на вождение разговор по телефону дольше полутора минут?",
    options: [
      "La velocidad media aumenta, incluso con el dispositivo de manos libres.",
      "El conductor no deja de percibir las señales si usa el dispositivo de manos libres.",
      "El conductor deja de percibir una parte importante de las señales, incluso con el dispositivo de manos libres.",
    ],
    correct: 2,
    explanation: "Hands-free освобождает руки, но не голову. После полутора минут разговора водитель перестаёт замечать заметную часть знаков, а скорость при этом не растёт, а падает.",
    principle: "«Incluso con manos libres» — в теме про телефон почти всегда верный ответ.",
  },
  {
    id: 7,
    question_es: "¿Cuándo debe desactivar el airbag frontal de un asiento?",
    question_ru: "Когда нужно отключить фронтальную подушку безопасности сиденья?",
    options: [
      "Cuando en ese asiento instale un dispositivo de retención para niños orientado hacia atrás.",
      "Cuando en ese asiento viaje una mujer embarazada.",
      "En ningún caso.",
    ],
    correct: 0,
    explanation: "Кресло против хода стоит спинкой прямо к приборной панели: раскрываясь, подушка ударит по креслу с ребёнком. Беременным подушку отключать не нужно.",
    principle: "Кресло спиной вперёд на переднем сиденье = подушка выключена.",
  },
  {
    id: 8,
    question_es: "El conductor que consume cocaína...",
    question_ru: "Водитель, употребляющий кокаин...",
    options: ["es más agresivo y menos competitivo.", "es más tranquilo y menos competitivo.", "puede volverse más competitivo y agresivo."],
    correct: 2,
    explanation: "Кокаин возбуждает: водитель чувствует себя всемогущим, соревнуется и злится. Первый вариант противоречит сам себе — агрессия и соперничество идут вместе.",
    principle: "Кокаин — соревновательность и агрессия; каннабис — медленная реакция и сонливость.",
  },
];
