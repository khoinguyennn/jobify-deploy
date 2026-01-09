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
-- Table structure for table `fields`
--

DROP TABLE IF EXISTS `fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `typeField` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fields`
--

LOCK TABLES `fields` WRITE;
/*!40000 ALTER TABLE `fields` DISABLE KEYS */;
INSERT INTO `fields` VALUES (1,'Biên phiên dịch / Thông dịch viên','Bộ phận hỗ trợ'),(2,'Nhân sự','Bộ phận hỗ trợ'),(3,'Pháp lý / Luật','Bộ phận hỗ trợ'),(4,'Thư ký / Hành Chính','Bộ phận hỗ trợ'),(5,'An ninh / Bảo vệ','Dịch vụ'),(6,'Bán lẻ / Bán sỉ','Dịch vụ'),(7,'Chăm sóc sức khỏe / Y tế','Dịch vụ'),(8,'Dịch vụ khách hàng','Dịch vụ'),(9,'Giáo dục / Đào tạo / Thư viện','Dịch vụ'),(10,'Phi chính phủ / Phi lợi nhuận','Dịch vụ'),(11,'Bảo hiểm','Dịch vụ tài chính'),(12,'Kế toán / Kiểm toán','Dịch vụ tài chính'),(13,'Ngân hàng / Chứng khoán','Dịch vụ tài chính'),(14,'Tài chính / Đầu tư','Dịch vụ tài chính'),(15,'Bán hàng / Kinh doanh','Dịch vụ khách hàng'),(16,'Hàng gia dụng','Dịch vụ khách hàng'),(17,'Quảng cáo / Đối ngoại','Dịch vụ khách hàng'),(18,'Thời trang','Dịch vụ khách hàng'),(19,'Tiếp thị','Dịch vụ khách hàng'),(20,'Tư vấn','Dịch vụ khách hàng'),(22,'Quản lý chất lượng','Hỗ trợ sản xuất'),(23,'Vận chuyển / Giao hàng / Kho bãi','Hỗ trợ sản xuất'),(24,'Vật tư / Thu mua','Hỗ trợ sản xuất'),(25,'Xuất nhập khẩu / Ngoại thương','Hỗ trợ sản xuất'),(26,'CNTT - Phần mềm','Công nghệ thông tin'),(27,'CNTT - Phần cứng / Mạng','Công nghệ thông tin'),(28,'Du lịch','Khách sạn / Du lịch'),(29,'Khách sạn','Khách sạn / Du lịch'),(30,'Nhà hàng / Dịch vụ ăn uống','Khách sạn / Du lịch'),(31,'Bảo trì / Sửa chữa','Kỹ thuật'),(32,'Điện lạnh / Nhiệt lạnh','Kỹ thuật'),(33,'Dược / Sinh học','Kỹ thuật'),(34,'Điện / Điện tử','Kỹ thuật'),(35,'Kỹ thuật ứng dụng / Cơ khí','Kỹ thuật'),(36,'Môi trường / Xử lý chất thải','Kỹ thuật'),(37,'An toàn lao động','Sản xuất'),(38,'Dầu khí / Khoáng sản','Sản xuất'),(39,'Dệt may / Da giày','Sản xuất'),(40,'Đồ gỗ','Sản xuất'),(41,'Hóa chất / Sinh hóa / Thực phẩm','Sản xuất'),(42,'Nông nghiệp / Lâm nghiệp','Sản xuất'),(43,'Ô tô','Sản xuất'),(44,'Sản xuất / Vận hành sản xuất','Sản xuất'),(45,'Thủy hải sản','Sản xuất'),(46,'Bất động sản','Xây dựng / Bất động sản'),(47,'Kiến trúc','Xây dựng / Bất động sản'),(48,'Nội thất / Ngoại thất','Xây dựng / Bất động sản'),(49,'Xây dựng','Xây dựng / Bất động sản'),(50,'Báo chí / Biên tập viên / Xuất bản','Truyền thông'),(51,'Nghệ thuật / Thiết kế','Truyền thông'),(52,'Viễn thông','Truyền thông'),(53,'Lao động phổ thông','Theo đối tượng'),(54,'Mới tốt nghiệp / Thực tập','Theo đối tượng'),(55,'Người nước ngoài','Theo đối tượng'),(56,'Quản lý điều hành','Theo đối tượng'),(57,'Khác','Khác'),(58,'Spa / Làm đẹp','Dịch vụ');
/*!40000 ALTER TABLE `fields` ENABLE KEYS */;
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
