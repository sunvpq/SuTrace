"""Seed the database with realistic water points for Atyrau and Mangystau regions."""
from database import engine, SessionLocal, Base
from models import WaterPoint

SEED_DATA = [
    # ===== АТЫРАУСКАЯ ОБЛАСТЬ =====
    # Жылыойский район — самоизливающиеся скважины
    {"name": "Скважина Кульсары-1", "type": "borehole", "status": "active", "water_quality": "fresh",
     "mineralization": 0.8, "depth": 120, "balance_holder": "КульсарыСуАрнасы",
     "latitude": 46.955, "longitude": 54.005, "district": "Жылыойский", "region": "Атырауская",
     "comment": "Самоизливающаяся, дебит ~50 м³/сут"},
    {"name": "Скважина Кульсары-7 (солёная)", "type": "borehole", "status": "active", "water_quality": "saline",
     "mineralization": 8.5, "depth": 95, "balance_holder": None,
     "latitude": 46.980, "longitude": 54.040, "district": "Жылыойский", "region": "Атырауская",
     "comment": "Высокая минерализация, используется для скота"},
    {"name": "Скважина Сарыкамыс", "type": "borehole", "status": "broken", "water_quality": "fresh",
     "mineralization": 1.2, "depth": 150, "balance_holder": "Недропользователь ТОО «Тенгизшевройл»",
     "latitude": 46.800, "longitude": 53.850, "district": "Жылыойский", "region": "Атырауская",
     "comment": "Задвижка сломана, вода изливается в степь ~15 м³/час"},
    {"name": "Скважина Кызылкога", "type": "borehole", "status": "active", "water_quality": "slightly_saline",
     "mineralization": 2.5, "depth": 80, "balance_holder": None,
     "latitude": 46.700, "longitude": 53.600, "district": "Жылыойский", "region": "Атырауская",
     "comment": "Жители используют для полива"},
    {"name": "Самоизливающаяся скважина №34", "type": "borehole", "status": "broken", "water_quality": "saline",
     "mineralization": 12.0, "depth": 200, "balance_holder": None,
     "latitude": 46.850, "longitude": 53.950, "district": "Жылыойский", "region": "Атырауская",
     "comment": "Соленость 12 г/л, не пригодна для питья, задвижка разрушена"},
    # Макатский район — заброшенные скважины
    {"name": "Скважина Макат-Центр", "type": "borehole", "status": "abandoned", "water_quality": "unknown",
     "mineralization": None, "depth": 110, "balance_holder": None,
     "latitude": 47.650, "longitude": 53.330, "district": "Макатский", "region": "Атырауская",
     "comment": "Заброшена с 2015 года, обсадная труба проржавела"},
    {"name": "Скважина Доссор", "type": "borehole", "status": "abandoned", "water_quality": "technical",
     "mineralization": 15.0, "depth": 180, "balance_holder": None,
     "latitude": 47.520, "longitude": 53.220, "district": "Макатский", "region": "Атырауская",
     "comment": "Бывшая нефтеразведочная, техническая вода"},
    {"name": "Колодец Макат-Восточный", "type": "well", "status": "broken", "water_quality": "saline",
     "mineralization": 6.0, "depth": 15, "balance_holder": "Акимат Макатского района",
     "latitude": 47.670, "longitude": 53.380, "district": "Макатский", "region": "Атырауская",
     "comment": "Насос сломан, построен по программе Ақ бұлақ"},
    # Махамбетский район — колодцы
    {"name": "Колодец Махамбет", "type": "well", "status": "active", "water_quality": "fresh",
     "mineralization": 0.6, "depth": 12, "balance_holder": "Акимат Махамбетского района",
     "latitude": 47.170, "longitude": 51.580, "district": "Махамбетский", "region": "Атырауская",
     "comment": "Пресная вода, обслуживает 3 двора"},
    {"name": "Колодец Ганюшкино", "type": "well", "status": "active", "water_quality": "slightly_saline",
     "mineralization": 2.0, "depth": 8, "balance_holder": None,
     "latitude": 46.900, "longitude": 51.350, "district": "Махамбетский", "region": "Атырауская",
     "comment": "Слабосолоноватая, жители используют после кипячения"},
    {"name": "Родник Аккыстау", "type": "spring", "status": "active", "water_quality": "fresh",
     "mineralization": 0.3, "depth": None, "balance_holder": None,
     "latitude": 47.050, "longitude": 51.700, "district": "Махамбетский", "region": "Атырауская",
     "comment": "Природный родник, пресная вода"},
    {"name": "Колодец Саркамыс", "type": "well", "status": "abandoned", "water_quality": "unknown",
     "mineralization": None, "depth": 10, "balance_holder": None,
     "latitude": 47.200, "longitude": 51.450, "district": "Махамбетский", "region": "Атырауская",
     "comment": "Колодец обрушился, не используется"},
    # Город Атырау
    {"name": "Водовоз Атырау-Привоз-1", "type": "water_truck", "status": "active", "water_quality": "fresh",
     "mineralization": 0.5, "depth": None, "balance_holder": "ИП Сериков",
     "latitude": 47.105, "longitude": 51.920, "district": "г. Атырау", "region": "Атырауская",
     "comment": "Привоз воды в частный сектор, 2000 тг/м³"},
    {"name": "Водовоз Атырау-Жилгородок", "type": "water_truck", "status": "active", "water_quality": "fresh",
     "mineralization": 0.4, "depth": None, "balance_holder": "ТОО «АтырауСу»",
     "latitude": 47.130, "longitude": 51.870, "district": "г. Атырау", "region": "Атырауская",
     "comment": "Обслуживает район Жилгородок"},
    {"name": "Скважина Балыкши", "type": "borehole", "status": "active", "water_quality": "technical",
     "mineralization": 5.5, "depth": 60, "balance_holder": "ТОО «АтырауСу»",
     "latitude": 47.080, "longitude": 51.950, "district": "г. Атырау", "region": "Атырауская",
     "comment": "Техническая вода для промышленных нужд"},
    {"name": "Колодец Атырау-Старый город", "type": "well", "status": "broken", "water_quality": "saline",
     "mineralization": 7.0, "depth": 20, "balance_holder": None,
     "latitude": 47.115, "longitude": 51.895, "district": "г. Атырау", "region": "Атырауская",
     "comment": "Исторический колодец, насос не работает"},
    {"name": "Скважина Геолог", "type": "borehole", "status": "abandoned", "water_quality": "unknown",
     "mineralization": None, "depth": 250, "balance_holder": None,
     "latitude": 47.150, "longitude": 52.050, "district": "г. Атырау", "region": "Атырауская",
     "comment": "Геологоразведочная, законсервирована"},
    # Исатайский район
    {"name": "Скважина Аккистау", "type": "borehole", "status": "active", "water_quality": "fresh",
     "mineralization": 0.9, "depth": 90, "balance_holder": "Акимат Исатайского района",
     "latitude": 47.500, "longitude": 51.200, "district": "Исатайский", "region": "Атырауская",
     "comment": "Питьевая скважина, обслуживает село"},
    {"name": "Колодец Исатай", "type": "well", "status": "broken", "water_quality": "slightly_saline",
     "mineralization": 3.0, "depth": 14, "balance_holder": None,
     "latitude": 47.460, "longitude": 51.150, "district": "Исатайский", "region": "Атырауская",
     "comment": "Построен по Ақ бұлақ, насос вышел из строя"},
    # Курмангазинский район
    {"name": "Скважина Ганюшкино-2", "type": "borehole", "status": "active", "water_quality": "saline",
     "mineralization": 9.0, "depth": 130, "balance_holder": None,
     "latitude": 46.830, "longitude": 51.100, "district": "Курмангазинский", "region": "Атырауская",
     "comment": "Солёная, используется только для скота"},

    # ===== МАНГИСТАУСКАЯ ОБЛАСТЬ =====
    # Каракиянский район (возле Жанаозена)
    {"name": "Колодец Жанаозен-Акбулак-1", "type": "well", "status": "abandoned", "water_quality": "unknown",
     "mineralization": None, "depth": 18, "balance_holder": "Акимат Каракиянского района",
     "latitude": 43.350, "longitude": 52.860, "district": "Каракиянский", "region": "Мангистауская",
     "comment": "Построен по программе Ақ бұлақ в 2012, заброшен с 2016"},
    {"name": "Колодец Жанаозен-Акбулак-3", "type": "well", "status": "abandoned", "water_quality": "saline",
     "mineralization": 10.0, "depth": 22, "balance_holder": "Акимат Каракиянского района",
     "latitude": 43.370, "longitude": 52.890, "district": "Каракиянский", "region": "Мангистауская",
     "comment": "Солёная вода, население отказалось использовать"},
    {"name": "Скважина Жанаозен-Промышленная", "type": "borehole", "status": "active", "water_quality": "technical",
     "mineralization": 11.0, "depth": 200, "balance_holder": "ТОО «ӨзенМұнайГаз»",
     "latitude": 43.340, "longitude": 52.830, "district": "Каракиянский", "region": "Мангистауская",
     "comment": "Техническая вода для нефтедобычи"},
    {"name": "Родник Тущыбек", "type": "spring", "status": "active", "water_quality": "fresh",
     "mineralization": 0.5, "depth": None, "balance_holder": None,
     "latitude": 43.500, "longitude": 52.700, "district": "Каракиянский", "region": "Мангистауская",
     "comment": "Единственный пресный источник в радиусе 40 км"},
    {"name": "Колодец Сенек", "type": "well", "status": "broken", "water_quality": "slightly_saline",
     "mineralization": 3.5, "depth": 15, "balance_holder": None,
     "latitude": 43.400, "longitude": 52.500, "district": "Каракиянский", "region": "Мангистауская",
     "comment": "Ручной насос сломан"},
    # Бейнеуский район (село Сарга)
    {"name": "Скважина Бейнеу-Центр", "type": "borehole", "status": "active", "water_quality": "technical",
     "mineralization": 7.0, "depth": 160, "balance_holder": "Акимат Бейнеуского района",
     "latitude": 45.320, "longitude": 55.200, "district": "Бейнеуский", "region": "Мангистауская",
     "comment": "Техническая вода, подаётся в опреснитель"},
    {"name": "Скважина Сарга", "type": "borehole", "status": "broken", "water_quality": "saline",
     "mineralization": 14.0, "depth": 140, "balance_holder": None,
     "latitude": 45.100, "longitude": 55.050, "district": "Бейнеуский", "region": "Мангистауская",
     "comment": "Сломана задвижка, солёная вода утекает"},
    {"name": "Колодец Сарга-Восточный", "type": "well", "status": "abandoned", "water_quality": "unknown",
     "mineralization": None, "depth": 12, "balance_holder": None,
     "latitude": 45.120, "longitude": 55.100, "district": "Бейнеуский", "region": "Мангистауская",
     "comment": "Обрушение стенок, небезопасен"},
    {"name": "Водовоз Бейнеу", "type": "water_truck", "status": "active", "water_quality": "fresh",
     "mineralization": 0.6, "depth": None, "balance_holder": "ИП Нурланов",
     "latitude": 45.330, "longitude": 55.180, "district": "Бейнеуский", "region": "Мангистауская",
     "comment": "Привозит опреснённую воду из Актау, 3000 тг/м³"},
    # Тупкараганский район (Форт-Шевченко)
    {"name": "Опреснитель Форт-Шевченко", "type": "borehole", "status": "active", "water_quality": "fresh",
     "mineralization": 0.4, "depth": 80, "balance_holder": "ТОО «КазОпреснение»",
     "latitude": 44.520, "longitude": 50.270, "district": "Тупкараганский", "region": "Мангистауская",
     "comment": "Опреснённая вода, снабжает город"},
    {"name": "Скважина Баутино", "type": "borehole", "status": "active", "water_quality": "saline",
     "mineralization": 8.0, "depth": 100, "balance_holder": None,
     "latitude": 44.550, "longitude": 50.240, "district": "Тупкараганский", "region": "Мангистауская",
     "comment": "Солёная, используется для технических нужд порта"},
    {"name": "Колодец Форт-Шевченко-Старый", "type": "well", "status": "abandoned", "water_quality": "saline",
     "mineralization": 9.5, "depth": 25, "balance_holder": None,
     "latitude": 44.510, "longitude": 50.310, "district": "Тупкараганский", "region": "Мангистауская",
     "comment": "Исторический колодец XIX века, не используется"},
    # Город Актау
    {"name": "Водовоз Актау-Микрорайон-1", "type": "water_truck", "status": "active", "water_quality": "fresh",
     "mineralization": 0.3, "depth": None, "balance_holder": "ТОО «АктауСу»",
     "latitude": 43.650, "longitude": 51.150, "district": "г. Актау", "region": "Мангистауская",
     "comment": "Опреснённая каспийская вода"},
    {"name": "Водовоз Актау-30 микрорайон", "type": "water_truck", "status": "active", "water_quality": "fresh",
     "mineralization": 0.3, "depth": None, "balance_holder": "ИП Бекмуратов",
     "latitude": 43.630, "longitude": 51.120, "district": "г. Актау", "region": "Мангистауская",
     "comment": "Привоз воды в новые микрорайоны"},
    {"name": "Скважина Актау-Техническая", "type": "borehole", "status": "active", "water_quality": "technical",
     "mineralization": 13.0, "depth": 180, "balance_holder": "ТОО «МАЭК-Казатомпром»",
     "latitude": 43.600, "longitude": 51.200, "district": "г. Актау", "region": "Мангистауская",
     "comment": "Техническая вода для МАЭК"},
    {"name": "Скважина Мунайши", "type": "borehole", "status": "broken", "water_quality": "saline",
     "mineralization": 11.5, "depth": 170, "balance_holder": None,
     "latitude": 43.550, "longitude": 51.300, "district": "г. Актау", "region": "Мангистауская",
     "comment": "Обсадная колонна повреждена"},
    # Мунайлинский район
    {"name": "Колодец Шетпе", "type": "well", "status": "active", "water_quality": "slightly_saline",
     "mineralization": 2.8, "depth": 16, "balance_holder": "Акимат Мунайлинского района",
     "latitude": 44.170, "longitude": 52.050, "district": "Мунайлинский", "region": "Мангистауская",
     "comment": "Используется чабанами для водопоя"},
    {"name": "Скважина Жетыбай", "type": "borehole", "status": "abandoned", "water_quality": "technical",
     "mineralization": 16.0, "depth": 220, "balance_holder": None,
     "latitude": 43.780, "longitude": 52.150, "district": "Мунайлинский", "region": "Мангистауская",
     "comment": "Бывшая нефтяная скважина, техническая вода"},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(WaterPoint).count() > 0:
        print(f"Database already has {db.query(WaterPoint).count()} points, skipping seed.")
        db.close()
        return
    for item in SEED_DATA:
        point = WaterPoint(**item)
        db.add(point)
    db.commit()
    print(f"Seeded {len(SEED_DATA)} water points.")
    db.close()


if __name__ == "__main__":
    seed()
