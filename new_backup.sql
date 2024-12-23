-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: user_management
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `avatar` varchar(255) DEFAULT NULL,
  `role` varchar(10) NOT NULL DEFAULT 'user',
  `role` enum('admin', 'user') NOT NULL DEFAULT 'user',
  `resetToken` varchar(255) DEFAULT NULL,
  `resetExpires` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'testuser',NULL,'12345','2024-12-08 13:08:46',NULL,'user',NULL,NULL),(2,'testuser',NULL,'12345','2024-12-08 14:05:35',NULL,'user',NULL,NULL),(3,'123456789',NULL,'az123456','2024-12-11 12:57:23',NULL,'user',NULL,NULL),(4,'testuser1',NULL,'Ax112211','2024-12-11 15:54:57',NULL,'user',NULL,NULL),(5,'suyi','suyi886278@gmail.com','$2b$10$SSWoCEUjtAdHBKs41edMIO1OknshQcgm4U9Y1GDBkN.ieVcGCPds.','2024-12-11 17:33:54','/uploads/avatar_5_1734193406376.png','admin',NULL,NULL),(6,'suyi1',NULL,'$2b$10$gnSoz9rDFobQpmAy3mTNfOfV9Emr4HKz579KO1g5oB4dUel5rCsY2','2024-12-11 17:35:29',NULL,'user',NULL,NULL),(7,'bibibi','geedsf226@gmail.com','$2b$10$hlwDaSHB85m4YJN8ChKPs.0tF36DzdaRkTcKfFr7R.ooFx1JJ2hma','2024-12-12 11:20:54',NULL,'user',NULL,NULL),(8,'suyi3','suyi886278@gmail.com','$2b$10$CPa0jR9hi3mSI9TmH3HiH.zFhcsu0/I4BPKtGeXOLL2xyVH2Dmixq','2024-12-13 16:44:39',NULL,'user','c1c17395712512ce89c53ef963aa3754578a2ccf',1734731427384),(9,'suyi4','geedsf22@gmail.com','$2b$10$9raKYHNcdY3QEP29BXXBT.vHHv3UUTN/k2/pONG0ELZJha82D0ry2','2024-12-15 17:37:24',NULL,'user',NULL,NULL),(10,'suyi5','eettffw@gmail.com','$2b$10$Rl4cUowZPK.g722yDnU8FOVuREIniXjzaDfyh3qBmnOA2HGku0Z6K','2024-12-16 19:44:02',NULL,'user',NULL,NULL),(11,'suyi6','lkk51809@gmail.com','$2b$10$Md6ONLdXQ8.Q2/ytdvgG7.lv2Q4604onautVMkEN98tkviI2gyQXS','2024-12-16 21:03:11',NULL,'user',NULL,NULL),(12,'suyi12','geedsf26@gmail.com','$2b$10$2iJDPZKt/VTrYcp6RBty8eV8ze0W/7/oUaptR0zF7LyM4rJAGZXqa','2024-12-16 21:27:40',NULL,'user',NULL,NULL),(13,'suyi11','etttffw@gmail.com','$2b$10$WAyhpr3FuDA4a4.7YzxizuxS/bVXAG7OfV8By/2t7J7JLHDXBEL2S','2024-12-17 11:46:46',NULL,'user',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-21  6:59:47
