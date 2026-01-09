-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: jobify_db
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provinces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nameWithType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES (1,'Tuyên Quang','Tỉnh Tuyên Quang'),(2,'Lào Cai','Tỉnh Lào Cai'),(3,'Thái Nguyên','Tỉnh Thái Nguyên'),(4,'Phú Thọ','Tỉnh Phú Thọ'),(5,'Bắc Ninh','Tỉnh Bắc Ninh'),(6,'Hưng Yên','Tỉnh Hưng Yên'),(7,'Hải Phòng','Thành phố Hải Phòng'),(8,'Ninh Bình','Tỉnh Ninh Bình'),(9,'Quảng Trị','Tỉnh Quảng Trị'),(10,'Đà Nẵng','Thành phố Đà Nẵng'),(11,'Quảng Ngãi','Tỉnh Quảng Ngãi'),(12,'Gia Lai','Tỉnh Gia Lai'),(13,'Khánh Hòa','Tỉnh Khánh Hòa'),(14,'Lâm Đồng','Tỉnh Lâm Đồng'),(15,'Đắk Lắk','Tỉnh Đắk Lắk'),(16,'Hồ Chí Minh','Thành phố Hồ Chí Minh'),(17,'Đồng Nai','Tỉnh Đồng Nai'),(18,'Tây Ninh','Tỉnh Tây Ninh'),(19,'Cần Thơ','Thành phố Cần Thơ'),(20,'Vĩnh Long','Tỉnh Vĩnh Long'),(21,'Đồng Tháp','Tỉnh Đồng Tháp'),(22,'Cà Mau','Tỉnh Cà Mau'),(23,'An Giang','Tỉnh An Giang'),(24,'Hà Nội','Thủ đô Hà Nội'),(25,'Huế','Thành phố Huế'),(26,'Lai Châu','Tỉnh Lai Châu'),(27,'Điện Biên','Tỉnh Điện Biên'),(28,'Sơn La','Tỉnh Sơn La'),(29,'Lạng Sơn','Tỉnh Lạng Sơn'),(30,'Quảng Ninh','Tỉnh Quảng Ninh'),(31,'Thanh Hóa','Tỉnh Thanh Hóa'),(32,'Nghệ An','Tỉnh Nghệ An'),(33,'Hà Tĩnh','Tỉnh Hà Tĩnh'),(34,'Cao Bằng','Tỉnh Cao Bằng');
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-04  9:46:56
