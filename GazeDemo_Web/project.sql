-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2021-11-11 02:01:17
-- 伺服器版本： 8.0.25
-- PHP 版本： 7.4.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫: `project`
--

-- --------------------------------------------------------

--
-- 資料表結構 `admins`
--

CREATE TABLE `admins` (
  `sid` int NOT NULL,
  `account` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT 'user' COMMENT 'admin/vip/user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `admins`
--

INSERT INTO `admins` (`sid`, `account`, `password_hash`, `nickname`, `status`) VALUES
(3, 'matches', '$2a$08$XfMUgmQwm9I0yRfeXGIavOPUQd4.22LWYjzeVFm5MdUCCQWuhW.A.', '士奇', 'admin'),
(4, 'thousand', '$2a$08$TgDchMi9lqBAWLTegLIVNu2RK8fxCACeT9lLGnTISBGe3E6lCbSOW', '小千', 'admin'),
(5, 'letter', '$2a$08$iSb7nhp8Z3OcSiOcwFOvR.ByMY2gi9Nhtt3G1gl82A6TF79lzJmGy', '信諭', 'admin'),
(6, 'forest', '$2a$08$3rj5NOwoUB.VzKYMG//6yuG.j.TWI60H7.zEtmn1rQmeKKC44pZdG', '長林', 'admin'),
(7, 'real', '$2a$08$Em0q7JMWY5rCuAV3Abd7A.Ou5lZJQ61pMpLCacvK.FI2ao0iBz/Ea', '霈珍', 'admin');

-- --------------------------------------------------------

--
-- 資料表結構 `itemlist`
--

CREATE TABLE `itemlist` (
  `item_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` int NOT NULL,
  `description` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `class` int UNSIGNED NOT NULL,
  `create_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `itemlist`
--

INSERT INTO `itemlist` (`item_id`, `name`, `title`, `price`, `description`, `class`, `create_date`) VALUES
(1, 'Chair', 'Lona 扶手布餐椅', 5990, '北美白橡木、A型結構椅腳<br>\n沙發級高密泡棉<br>\n寬度:56公分<br>\n深度:59公分<br>\n高度: 78 公分<br>\n座椅寬度:50公分<br>\n座椅深度:48公分<br>\n座椅高度:50公分<br>', 56, '2021-10-28'),
(2, 'Wine_glass', 'SVALKA 紅酒杯', 299, '可保持酒的香氣和味道<br>\n達到醒酒效果，讓口感更好<br>\n高度:18公分 容積:300毫升<br>', 40, '2021-10-28'),
(3, 'Cup', '金邊馬克杯', 450, '奮鬥吧極簡金邊附蓋勺馬克杯<br>\n看膩了花花綠綠的馬克杯<br>\n也許該來一只純粹的馬克杯，陪伴你日常點滴。<br>　\n純粹素色，百搭的簡約風格<br>\n金邊點綴，小細節更吸睛<br>\n霧面材質，觸感極佳<br>\n英文Hero/Fight，為你的日常生活加油打氣<br>\n．貼心附蓋，不怕灰塵掉入\n．同系列金色小勺，方便攪拌飲品', 41, '2021-10-28'),
(4, 'Bottle', '冰裂玻璃花器', 607, '花瓶桌面裝飾<br>手工玻璃吹製-多道工序製成,形成自然紋理<br>冰花裂紋效果-內壁完整光滑,獨特設計凸顯質感<br>瓶口圓潤打磨,防割手設計,加厚設計不易碎', 39, '2021-10-28'),
(5, 'Cell_phone', 'IPhone 13 Pro Max', 36900, 'Pro 相機系統，威力驚人提升。<br>\n顯示器反應超靈敏，讓體驗全面更新。<br>\n全世界最快速的智慧型手機晶片。<br>\n耐用度格外出色，電池續航力更是大幅躍升。', 67, '2021-10-28'),
(6, 'Car', 'TESLA Model S', 3254900, '續航里程:637公里<br>\n尖峰功率:1020hp<br>\n最高速度:322公里/小時<br>\n驅動:三馬達全輪驅動<br>', 2, '2021-10-28'),
(7, 'Couch', '北歐風格沙發 加大三人座', 15500, '質樸日系氣息，質感自然溫和<br>\n實木框架，結實穩固<br>\n舒適棉麻，透氣清爽<br>\n椅腳採用天然實木打造<br>', 57, '2021-10-28'),
(8, 'Dining_table', '樂華原木色 拉合餐桌', 6480, '高級MDF+實木腳打造<br>\n仿大理石紋5MM強化玻璃<br>\n收合:寬110.5/深75.5/高73.5<br>\n展開:寬140.5/深75.5/高73.5<br>', 60, '2021-10-28'),
(9, 'Laptop', 'HP ENVY 15-ep0156TX', 73900, '輕薄15吋翻轉, 超高行動性<br>\n鋁合金A/C/D蓋，無塵美學設計, 簡潔大方<br>\n<4K OLED螢幕, 高色域高對比低藍光><br>\n僅5.34mm薄的極窄邊框讓視野盡收眼底<br>\n82.61%螢幕佔比, 視野寬廣無限<br>\nOLED 4K螢幕, 更薄, 耗電降低, 更好的黑色表現<br>\n100% DCI-P3 色域, 400nits亮度, 專業色彩呈現, 畫面表現更為豐富', 63, '2021-10-28'),
(10, 'Bed', '北歐風貓抓皮 五尺床台', 13500, '內部材質：實木骨架 + 高密度泡棉<br>\n外部材質：耐刮防水貓抓皮<br>\n備註：台灣製造，可訂製顏色<br>', 59, '2021-10-28');

-- --------------------------------------------------------

--
-- 資料表結構 `video`
--

CREATE TABLE `video` (
  `video_key` int NOT NULL,
  `vid` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `sid` int UNSIGNED NOT NULL,
  `video_txt` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `video_path` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `checking` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `video`
--

INSERT INTO `video` (`video_key`, `vid`, `sid`, `video_txt`, `video_path`, `checking`, `create_time`) VALUES
(1, 'chair_stuff', 0, 'chair_stuff.txt', 'chair_stuff.mp4', 0, '2021-10-28 00:32:00'),
(2, 'tea', 0, 'tea.txt', 'tea.mp4', 0, '2021-10-27 16:00:00'),
(3, 'sakura', 0, 'sakura.txt', 'sakura.mp4', 0, '2021-10-27 16:00:00'),
(4, 'IKEA', 0, 'IKEA.txt', 'IKEA.mp4', 0, '2021-10-29 06:47:59'),
(5, 'house', 0, 'house.txt', 'house.mp4', 0, '2021-11-04 09:32:10');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`sid`),
  ADD UNIQUE KEY `account` (`account`);

--
-- 資料表索引 `itemlist`
--
ALTER TABLE `itemlist`
  ADD PRIMARY KEY (`item_id`);

--
-- 資料表索引 `video`
--
ALTER TABLE `video`
  ADD PRIMARY KEY (`video_key`),
  ADD KEY `sid` (`sid`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `admins`
--
ALTER TABLE `admins`
  MODIFY `sid` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `itemlist`
--
ALTER TABLE `itemlist`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `video`
--
ALTER TABLE `video`
  MODIFY `video_key` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
