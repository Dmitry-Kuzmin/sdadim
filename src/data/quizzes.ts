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
