-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 26, 2023 at 02:43 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nodelogin`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(10) NOT NULL,
  `code` varchar(20) NOT NULL,
  `title` varchar(250) NOT NULL,
  `description` varchar(512) NOT NULL,
  `category` varchar(30) NOT NULL,
  `certificate` varchar(50) NOT NULL,
  `duration` int(30) NOT NULL,
  `cost` decimal(30,0) NOT NULL,
  `imagePath` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code`, `title`, `description`, `category`, `certificate`, `duration`, `cost`, `imagePath`, `user_id`) VALUES
(46, 'BD5241', 'Backend Development', 'Backend development is one of the web development skills required by the Software Eng.', 'Web Development', 'Professional Certificate', 2, '200', 'None', 19),
(42, 'BW634', 'Web Design and Development', 'Backend development is one of the web development skills required by the Software Eng.', 'Internet Programming', 'Course completion', 2, '220', '/images/Course-BW634-2022-51-22.png', 13),
(47, 'BW634x', 'Basics of Web Design', 'Backend development is one of the web development skills required by the Software Eng.', 'Web Development', 'Course completion', 2, '220', 'None', 19),
(45, 'CN542', 'Computer Networking', 'Computer Networking is a process of connecting computing devices', 'Networking and Communication', 'Professional Certificate', 3, '561', 'None', 13),
(25, 'PM2456', 'Project Management', 'This site can’t be reached', 'Management', 'Participation Certificate', 3, '250', '/images/Course-PM412-2022-51-20.png', 19),
(49, 'PY5214x', 'Python for AI', 'Connect-flash module for Node. js is a web development framework', 'Web Development', 'Course completion', 3, '210', 'None', 19),
(43, 'UI568', 'Software UI/Ux Design', 'This site can’t be reached', 'Management', 'Participation Certificate', 1, '320', 'None', 13),
(21, 'WB14', 'Nodejs', 'Connect-flash module for Node. js is a web development framework', 'Web Development', 'Course completion', 2, '120', '/images/Course-WB14-2022-51-20.png', 19);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('0bd9nLzzjYc5DKB9YlLiaU69y0Lxs_DI', 1655712771, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2022-06-20T07:52:30.071Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":1}}'),
('UP0LEqFc-uVxPn1Jet9RakuX481Z7DL4', 1654252991, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `fname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `level` int(11) NOT NULL DEFAULT 0,
  `token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fname`, `lname`, `gender`, `email`, `password`, `level`, `token`) VALUES
(13, 'Yohannes', 'Admin', 'Male', 'assefayohannes123@gmail.com', '$2a$10$NErY5uDqVOzLCTOTft4VbO4Eb.PugDXGdoHfha9UI8Qt5DFaoj9wO', 1, 'T2v5b8g7QpT4nwvcKXRb'),
(19, 'Yohannes', 'Assefa', 'Male', 'yoniassefayoni@gmail.com', '$2a$10$D7o12eqiJg3y6xHhqtyir.lmdCJc7TiJkBe3dcBrSrzjMjRbaOHyS', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`code`),
  ADD KEY `id` (`id`);
ALTER TABLE `courses` ADD FULLTEXT KEY `code` (`code`,`title`,`description`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
