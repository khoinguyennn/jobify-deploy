-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
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
-- Table structure for table `apply_job`
--

DROP TABLE IF EXISTS `apply_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apply_job` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUser` int DEFAULT NULL,
  `idJob` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int DEFAULT NULL,
  `letter` varchar(10000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cv` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idUser` (`idUser`),
  KEY `idJob` (`idJob`),
  CONSTRAINT `apply_job_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`id`),
  CONSTRAINT `apply_job_ibfk_2` FOREIGN KEY (`idJob`) REFERENCES `jobs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apply_job`
--

LOCK TABLES `apply_job` WRITE;
/*!40000 ALTER TABLE `apply_job` DISABLE KEYS */;
/*!40000 ALTER TABLE `apply_job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nameCompany` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nameAdmin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatarPic` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idProvince` int DEFAULT NULL,
  `intro` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scale` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `web` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token for company password reset functionality',
  `resetTokenExpiry` datetime DEFAULT NULL COMMENT 'Expiry time for company reset token (15 minutes from creation)',
  PRIMARY KEY (`id`),
  KEY `idProvince` (`idProvince`),
  KEY `idx_companies_reset_token` (`resetToken`),
  CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`idProvince`) REFERENCES `provinces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Facebook','Trần Văn Anh','vananh@facebook.com','$2b$10$s0NgM735lCGU9iTIP97dpedjGIqaZn6bz7eRs5sIEPHIipLVUWvgC','logos/avatar-1-04b8167a-1116-4ba7-9806-6cfa1df26c20.jpg','0987762723',19,'<p>Facebook (thuộc tập đoàn Meta Platforms, Inc.) là một trong những công ty công nghệ hàng đầu thế giới, tập trung vào việc xây dựng các nền tảng kết nối hàng tỷ người dùng trên toàn cầu. Với sứ mệnh <em>“trao quyền cho mọi người xây dựng cộng đồng và đưa thế giới lại gần nhau hơn”</em>, Facebook cung cấp nhiều sản phẩm nổi bật như Facebook App, Messenger, Instagram, WhatsApp và các giải pháp công nghệ thực tế ảo – tăng cường (VR/AR) như Meta Quest.</p><p>Tại Việt Nam, Facebook là nền tảng mạng xã hội được yêu thích, hỗ trợ doanh nghiệp tiếp cận khách hàng, quảng bá thương hiệu và phát triển kinh doanh. Chúng tôi luôn hướng đến việc tạo ra môi trường làm việc năng động, sáng tạo, đề cao đổi mới và khuyến khích nhân viên thể hiện tối đa khả năng của mình.</p>','nhiều hơn 5000','https://facebook.com',NULL,NULL),(2,'Microsoft','Nguyễn Văn Bình','nguyenvanbinh@gmail.com','$2b$10$sQQP9g.77jGinzoQ4N0L4e7oilULG/hnBsG0NqWX65Y7cBXlcDtKC','logos/avatar-2-13c5825c-97c8-4adb-ac85-3ff498542faa.jpg','0988872636',20,'Microsoft là một tập đoàn công nghệ đa quốc gia của Mỹ, được thành lập vào năm 1975 bởi Bill Gates và Paul Allen. Công ty phát triển, sản xuất và cấp phép nhiều sản phẩm phần mềm, bao gồm hệ điều hành Windows, bộ phần mềm Office và nền tảng đám mây Azure. Với sứ mệnh trao quyền cho mọi người và mọi tổ chức để đạt được nhiều thành tựu hơn, Microsoft đã mở rộng sang các lĩnh vực như phần cứng (máy tính, Xbox), dịch vụ đám mây và các giải pháp hỗ trợ trí tuệ nhân tạo (AI).','100 - 500','https://www.microsoft.com',NULL,NULL),(3,'Apple','Vương Quang Anh','vuongquanganh@gmail.com','$2b$10$o46oMUAun9Ogp/I3Lbd6K.opmLP0gz1k9Vpskv48.BPKk9oLscFZW','logos/avatar-3-d818ec04-2b58-42a6-b2da-3c9b91003592.jpg','0987727273',16,'Apple Inc. is an American multinational technology company headquartered in Cupertino, California, in Silicon Valley, best known for its consumer electronics, software and online services. Founded in 1976 as Apple Computer Company by Steve Jobs, Steve Wozniak and Ronald Wayne, the company was incorporated by Jobs and Wozniak as Apple Computer, Inc. the following year. It was renamed to its current name in 2007 as the company had expanded its focus from computers to consumer electronics. Apple has been described as a Big Tech company.','nhiều hơn 5000','https://apple.com',NULL,NULL),(4,'Starbucks','Võ Văn Nam','vovannam@gmail.com','$2b$10$EkT2GuA9wk9yuVydVAUoaue4QNl4QwA0ZacllsJIEcIJekneF78Om','logos/avatar-4-a40f8679-fd08-4a6a-880a-41ac85eb4e9a.jpg','0988727777',13,'Starbucks là chuỗi cửa hàng cà phê đa quốc gia nổi tiếng toàn cầu, được thành lập tại Seattle, Hoa Kỳ vào năm 1971. Công ty bắt đầu là một cửa hàng bán lẻ cà phê hạt, trà và gia vị duy nhất tại Chợ Pike Place và ngày nay đã mở rộng ra hàng ngàn cửa hàng tại hơn 80 quốc gia, tập trung vào chất lượng sản phẩm và trải nghiệm khách hàng.','500 - 1000','https://www.starbucks.com',NULL,NULL),(5,'NVIDIA','Lê Văn Ánh','levananh@gmail.com','$2b$10$WG.zKBLBEkP6aHfKQogiU.nZAW4LLoKRazQrITA1x8pEnyvyYss8e','logos/avatar-5-3c303a03-0199-4a60-bbae-d59e847ed7f4.jpg','0987765656',9,'NVIDIA một tập đoàn đa quốc gia, chuyên về phát triển bộ xử lý đồ họa (GPU) và công nghệ chipset cho các máy trạm, máy tính cá nhân, và các thiết bị di động. Công ty có trụ sở tại Santa Clara, California, trở thành một nhà cung cấp chính của các mạch tích hợp (ICS) như là đơn vị xử lý đồ họa (GPU) và chipset đồ họa được sử dụng trong thẻ, và giao tiếp trò chơi video và bo mạch chủ của máy tính cá nhân.','100 - 500','https://www.nvidia.com',NULL,NULL),(6,'Lego','Lê Thị Trinh','lethitrinh@gmail.com','$2b$10$Ppb5Re4BKVUwHh/U7LUdTOLr.r5VTVwBeUIgevrPhe34KbQ7mReD2','logos/avatar-6-fe733fa2-7388-4bde-92cf-dbb5c87c5b04.jpg','099992929',6,'LEGO là một công ty đồ chơi lắp ráp của Đan Mạch, thành lập năm 1932 bởi Ole Kirk Kristiansen, ban đầu là một xưởng mộc và phát triển thành một trong những nhà sản xuất đồ chơi lớn nhất thế giới.','20 - 100','https://www.lego.com',NULL,NULL),(7,'FPT Software','Nguyễn Thị Ngọc Ngân','ngocngan@example.com','$2b$10$8ufzAszaKMfbZ01qcM0Pxe0y9wyKE5qtulht5gBFuCJOYS.XObDgO','logos/avatar-7-c0538c88-40d3-428c-a4d8-65956261c578.jpg','097662632',16,NULL,'1000 - 5000','https://fptsoftware.com',NULL,NULL),(8,'Netflix','Nguyễn Ngọc Như','ngocnhu@gmail.com','$2b$10$12h9coy1gHmYiYU5aU3Ts.I29ng4wbp6luScFYsZ2Sam6RsoTh836','logos/avatar-8-634aa943-7b8a-4264-8cfa-2f6ccdd654b1.jpg','0872167876',15,'Netflix is an American subscription video on-demand over-the-top streaming service. The service primarily distributes original and acquired films and television shows from various genres, and it is available internationally in multiple languages.','100 - 500','https://www.netflix.com',NULL,NULL),(9,'Kien Long Bank','Nguyễn Văn Kiên','nguyenvankien@gmail.com','$2b$10$3UaAblLsLOh9HtD9nY/PaOADee3trsrf.9E6H6z8BgQ.vhbCaSUz.',NULL,'0987726263',24,NULL,'20 - 100',NULL,NULL,NULL),(10,'CÔNG TY CỔ PHẦN NDS VIETNAM','Trầm Khôi Nguyên','tramkhoinguyen.dev@gmail.com','$2b$10$IpjUzWJ.Nde8ZWYeBaKor.goVScnrZJloOGCESwCH4GN1aalBrdaC','logos/avatar-10-a24b2ef5-5658-486f-ab29-c4f6d7493984.png','0987765652',16,'<p>TEST</p>','100 - 500',NULL,NULL,NULL),(11,'Ngân Hàng TMCP Việt Nam Thịnh Vượng (VPBank)','Lê Văn Long','levanlong@gmail.com','$2b$10$qkFGM2y4PSbz0S0UwqmaWe/K7upv.3AKccPWmja9FIFUqJI7Fvp1y','logos/avatar-11-64759c25-1316-41fa-b9da-4eca2df86269.png','0987765265',16,'<p>VPBank xác định mục tiêu chiến lược phát triển 5 năm lần thứ 3 (2022-2026) trở thành ngân hàng có vị trí vững chắc trong Top 3 ngân hàng lớn nhất Việt Nam và đạt quy mô thuộc Top 100 ngân hàng lớn nhất châu Á.</p><p>Thành tựu của hai giai đoạn phát triển liền trước (2012-2017 và 2018-2022) đã tạo nền tảng và xung lực toàn diện để VPBank tự tin nối tiếp thành công trong chiến lược phát triển giai đoạn mới, qua đó tiếp tục góp phần thúc đẩy sự phát triển bền vững và thịnh vượng của đất nước và cộng đồng; tiếp tục gia tăng các giá trị mang đến cho khách hàng, cổ đông và nhà đầu tư.</p>','500 - 1000',NULL,NULL,NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Table structure for table `follow_company`
--

DROP TABLE IF EXISTS `follow_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follow_company` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUser` int DEFAULT NULL,
  `idCompany` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idUser` (`idUser`),
  KEY `idCompany` (`idCompany`),
  CONSTRAINT `follow_company_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`id`),
  CONSTRAINT `follow_company_ibfk_2` FOREIGN KEY (`idCompany`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follow_company`
--

LOCK TABLES `follow_company` WRITE;
/*!40000 ALTER TABLE `follow_company` DISABLE KEYS */;
INSERT INTO `follow_company` VALUES (17,2,1,'2025-12-08 12:24:10');
/*!40000 ALTER TABLE `follow_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idCompany` int DEFAULT NULL,
  `idField` int DEFAULT NULL,
  `idProvince` int DEFAULT NULL,
  `nameJob` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request` varchar(5000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `desc` varchar(5000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other` varchar(5000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salaryMin` int DEFAULT NULL,
  `salaryMax` int DEFAULT NULL,
  `sex` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `typeWork` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idCompany` (`idCompany`),
  KEY `idField` (`idField`),
  KEY `idProvince` (`idProvince`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`idCompany`) REFERENCES `companies` (`id`),
  CONSTRAINT `jobs_ibfk_2` FOREIGN KEY (`idField`) REFERENCES `fields` (`id`),
  CONSTRAINT `jobs_ibfk_3` FOREIGN KEY (`idProvince`) REFERENCES `provinces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (1,1,26,19,'Chuyên viên Phân tích Dữ liệu (Data Analyst)','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Tốt nghiệp Đại học ngành CNTT, Kinh tế, Toán – Thống kê, Phân tích dữ liệu hoặc liên quan.</p></li><li class=\"tiptap-list-item\"><p>Thành thạo SQL và tối thiểu một công cụ phân tích như Python, R hoặc BigQuery.</p></li><li class=\"tiptap-list-item\"><p>Có kinh nghiệm làm việc với dashboard: Power BI, Tableau hoặc Looker Studio.</p></li><li class=\"tiptap-list-item\"><p>Khả năng phân tích logic, tư duy dữ liệu mạnh.</p></li><li class=\"tiptap-list-item\"><p>Kỹ năng giao tiếp và trình bày báo cáo tốt.</p></li><li class=\"tiptap-list-item\"><p>Kinh nghiệm trong môi trường sản phẩm công nghệ là lợi thế.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Thu thập, xử lý và phân tích dữ liệu từ các sản phẩm của Meta (Facebook, Instagram, Messenger).</p></li><li class=\"tiptap-list-item\"><p>Xây dựng báo cáo, dashboard và visualizations giúp đánh giá hành vi người dùng.</p></li><li class=\"tiptap-list-item\"><p>Hỗ trợ đội ngũ sản phẩm trong việc ra quyết định dựa trên dữ liệu.</p></li><li class=\"tiptap-list-item\"><p>Phát hiện vấn đề, đề xuất giải pháp cải thiện trải nghiệm người dùng.</p></li><li class=\"tiptap-list-item\"><p>Tham gia thiết kế, xây dựng pipeline dữ liệu và tối ưu hệ thống đo lường.</p></li><li class=\"tiptap-list-item\"><p>Phối hợp với các nhóm kỹ thuật và product team để triển khai các mô hình và thử nghiệm A/B.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Môi trường làm việc sáng tạo, năng động, hướng đến dữ liệu.</p></li><li class=\"tiptap-list-item\"><p>Cơ hội tham gia các dự án với lượng dữ liệu người dùng cực lớn.</p></li><li class=\"tiptap-list-item\"><p>Chế độ lương thưởng hấp dẫn, review hiệu suất 6 tháng/lần.</p></li><li class=\"tiptap-list-item\"><p>Tham gia workshop chuyên môn cùng chuyên gia Meta toàn cầu.</p></li><li class=\"tiptap-list-item\"><p>Phúc lợi đầy đủ: bảo hiểm cao cấp, nghỉ phép linh hoạt, hỗ trợ khám sức khỏe.</p></li></ul><p></p>',25,35,'Nam','Nhân viên chính thức','Đại học','2 - 5 năm','2025-11-14 09:44:00',NULL),(2,1,8,19,'Chuyên viên Chăm sóc Khách hàng','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Có kinh nghiệm tối thiểu 1 năm trong lĩnh vực CSKH hoặc hỗ trợ khách hàng.</p></li><li class=\"tiptap-list-item\"><p>Giao tiếp rõ ràng, kỹ năng xử lý tình huống tốt.</p></li><li class=\"tiptap-list-item\"><p>Khả năng đọc hiểu tiếng Anh ở mức khá.</p></li><li class=\"tiptap-list-item\"><p>Tinh thần trách nhiệm cao, chịu được áp lực công việc.</p></li><li class=\"tiptap-list-item\"><p>Thành thạo các ứng dụng văn phòng và thao tác trên máy tính.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Tiếp nhận và xử lý các yêu cầu, thắc mắc của người dùng Facebook thông qua email và hệ thống ticket.</p></li><li class=\"tiptap-list-item\"><p>Hỗ trợ kiểm tra, xác minh tài khoản, giải quyết các trường hợp bị khóa hoặc báo cáo sai phạm.</p></li><li class=\"tiptap-list-item\"><p>Phối hợp với các bộ phận nội bộ nhằm nâng cao chất lượng trải nghiệm người dùng.</p></li><li class=\"tiptap-list-item\"><p>Báo cáo định kỳ về các vấn đề người dùng gặp phải và đề xuất hướng cải thiện.</p></li><li class=\"tiptap-list-item\"><p>Đảm bảo tuân thủ tiêu chuẩn dịch vụ, thời gian phản hồi và quy trình hỗ trợ.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Môi trường làm việc trẻ trung, sáng tạo theo phong cách Meta (Facebook).</p></li><li class=\"tiptap-list-item\"><p>Được đào tạo từ các chuyên gia trong ngành công nghệ.</p></li><li class=\"tiptap-list-item\"><p>Lương thưởng cạnh tranh, đánh giá hiệu suất hằng quý.</p></li><li class=\"tiptap-list-item\"><p>Cơ hội làm việc với các dự án liên quan đến bảo mật và trải nghiệm người dùng.</p></li></ul><p></p>',12,18,'Cả hai','Nhân viên chính thức','Đại học','1 - 2 năm','2025-11-14 09:47:48',NULL),(3,1,2,19,'Chuyên viên Tuyển dụng (Recruitment Executive)','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Có kinh nghiệm tuyển dụng tối thiểu 1 năm (ưu tiên trong ngành công nghệ).</p></li><li class=\"tiptap-list-item\"><p>Thành thạo kỹ năng tìm kiếm và phân tích hồ sơ ứng viên.</p></li><li class=\"tiptap-list-item\"><p>Kỹ năng giao tiếp và phỏng vấn tốt.</p></li><li class=\"tiptap-list-item\"><p>Tiếng Anh giao tiếp khá.</p></li><li class=\"tiptap-list-item\"><p>Nhanh nhẹn, tư duy logic và tinh thần trách nhiệm cao.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Thực hiện quy trình tuyển dụng cho các vị trí tại Meta Việt Nam.</p></li><li class=\"tiptap-list-item\"><p>Sàng lọc hồ sơ, phỏng vấn sơ bộ và phối hợp phỏng vấn chuyên môn.</p></li><li class=\"tiptap-list-item\"><p>Tìm kiếm ứng viên qua LinkedIn, Facebook và các nền tảng tuyển dụng.</p></li><li class=\"tiptap-list-item\"><p>Hỗ trợ xây dựng thương hiệu tuyển dụng (Employer Branding).</p></li><li class=\"tiptap-list-item\"><p>Theo dõi chỉ số tuyển dụng và báo cáo định kỳ.</p></li><li class=\"tiptap-list-item\"><p>Đảm bảo trải nghiệm ứng viên tốt (Candidate Experience).</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Môi trường quốc tế, chuyên nghiệp và hiện đại.</p></li><li class=\"tiptap-list-item\"><p>Cơ hội làm việc với đội ngũ Meta khu vực Châu Á – Thái Bình Dương.</p></li><li class=\"tiptap-list-item\"><p>Lương thưởng hấp dẫn, nhiều phúc lợi bổ sung.</p></li><li class=\"tiptap-list-item\"><p>Chế độ đào tạo nâng cao kỹ năng tuyển dụng.</p></li></ul><p></p>',20,30,'Cả hai','Nhân viên chính thức','Đại học','1 - 2 năm','2025-11-28 19:25:08',NULL),(4,1,54,19,'Thực tập sinh Hỗ trợ Người dùng (User Support Intern)','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Sinh viên thuộc các ngành: CNTT, Truyền thông, Marketing, Business hoặc tương đương.</p></li><li class=\"tiptap-list-item\"><p>Kỹ năng giao tiếp tốt, sắp xếp công việc khoa học.</p></li><li class=\"tiptap-list-item\"><p>Tư duy logic, chủ động, ham học hỏi.</p></li><li class=\"tiptap-list-item\"><p>Tiếng Anh đọc hiểu ở mức khá.</p></li><li class=\"tiptap-list-item\"><p>Có trách nhiệm và cam kết thời gian thực tập tối thiểu 3 tháng.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Hỗ trợ đội ngũ CSKH xử lý câu hỏi từ người dùng Facebook/Messenger.</p></li><li class=\"tiptap-list-item\"><p>Kiểm tra, xác minh thông tin người dùng theo quy trình chuẩn.</p></li><li class=\"tiptap-list-item\"><p>Ghi nhận lỗi, sự cố và chuyển tiếp đến bộ phận kỹ thuật.</p></li><li class=\"tiptap-list-item\"><p>Tham gia kiểm thử (testing) các tính năng mới trước khi triển khai rộng rãi.</p></li><li class=\"tiptap-list-item\"><p>Hỗ trợ tạo tài liệu, báo cáo và ghi chép trong các cuộc họp.</p></li><li class=\"tiptap-list-item\"><p>Học hỏi quy trình vận hành của Meta và kỹ năng làm việc chuyên nghiệp.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Môi trường làm việc năng động, mentor hướng dẫn trực tiếp.</p></li><li class=\"tiptap-list-item\"><p>Được cấp chứng nhận thực tập bởi Meta.</p></li><li class=\"tiptap-list-item\"><p>Cơ hội trở thành nhân viên chính thức sau kỳ thực tập.</p></li><li class=\"tiptap-list-item\"><p>Phụ cấp đầy đủ + hỗ trợ gửi xe.</p></li><li class=\"tiptap-list-item\"><p>Tham gia workshop và khóa học nội bộ do Meta tổ chức.</p></li></ul><p></p>',4,6,'Cả hai','Thực tập','Không yêu cầu','Không yêu cầu','2025-11-28 19:30:42',NULL),(5,1,19,19,'Chuyên viên Marketing – Digital Marketing Executive','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Có kinh nghiệm Marketing Online tối thiểu 1 năm.</p></li><li class=\"tiptap-list-item\"><p>Thành thạo Facebook Ads Manager và các công cụ đo lường.</p></li><li class=\"tiptap-list-item\"><p>Tư duy sáng tạo, khả năng phân tích dữ liệu tốt.</p></li><li class=\"tiptap-list-item\"><p>Hiểu biết về hành vi người dùng trên mạng xã hội.</p></li><li class=\"tiptap-list-item\"><p>Kỹ năng teamwork tốt.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Lên kế hoạch và triển khai các chiến dịch quảng cáo trên Facebook, Instagram.</p></li><li class=\"tiptap-list-item\"><p>Phân tích dữ liệu quảng cáo, tối ưu ngân sách và tỷ lệ chuyển đổi.</p></li><li class=\"tiptap-list-item\"><p>Theo dõi insight người dùng và đề xuất chiến lược nội dung.</p></li><li class=\"tiptap-list-item\"><p>Phối hợp với Content/Design để xây dựng thông điệp quảng cáo hiệu quả.</p></li><li class=\"tiptap-list-item\"><p>Theo dõi KPI chiến dịch và báo cáo định kỳ.</p></li><li class=\"tiptap-list-item\"><p>Hỗ trợ các dự án marketing nội bộ của Meta tại Việt Nam.</p></li></ul><p></p>','<ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Cơ hội làm việc trong môi trường công nghệ sáng tạo.</p></li><li class=\"tiptap-list-item\"><p>Phúc lợi đa dạng: đào tạo, chăm sóc sức khỏe, hỗ trợ học tập.</p></li><li class=\"tiptap-list-item\"><p>Tham gia workshop Meta Blueprint miễn phí.</p></li><li class=\"tiptap-list-item\"><p>Lương thưởng theo năng lực + thưởng chiến dịch.</p></li></ul><p></p>',18,28,'Nữ','Nhân viên chính thức','Cao đẳng','1 - 2 năm','2025-11-28 19:32:28',NULL),(6,11,2,16,'Trưởng Phòng Khách Hàng Ưu Tiên','<p>1. Trình độ chuyên môn: Tốt nghiệp Đại học các ngành Tài chính/ Kinh tế</p><p>2. Các Kinh nghiệm liên quan:</p><p>- Có kinh nghiệm và kỹ năng quản lý và chăm sóc KH ưu tiên, KH cao cấp tốt.</p><p>- Ít nhất 02 năm kinh nghiệm ở vị trí quản lý/bán hàng trực tiếp cho phân khúc KH cao cấp thuộc lĩnh vực tài chính/ngân hàng/đầu tư/bảo hiểm/du lịch/khách sạn/BĐS/chứng khoán.</p><p>- Hoặc tối thiểu 05 năm kinh nghiệm với thành tích công việc/bán hàng tốt nếu không liên quan đến phân khúc KH cao cấp.</p><p>- Có kinh nghiệm/khả năng đào tạo, truyền thông và tổ chức các hoạt động bán hàng tốt, với quy mô nhân viên bán hàng lớn.</p><p>3. Kiến thức/ Chuyên môn Có Liên Quan</p><p>- Hiểu biết các văn bản pháp luật liên quan đến tổ chức, hoạt động ngân hàng, tài chính nói chung.</p><p>- Sở hữu kiến thức sâu rộng trong lĩnh vực tài chính, ngân hàng, kinh tế thị trường, đầu tư, bảo hiểm, bất động sản, chứng khoán, ngoại hối...và các quy định, kiến thức pháp lý liên quan.</p><p>- Am hiểu các sản phẩm, dịch vụ tài chính - ngân hàng dành cho khách hàng ưu tiên, khách hàng cao cấp (cá nhân)</p><p>- Có kiến thức về quản lý nhân sự</p><p>4. Các Kỹ Năng</p><p>- Kỹ năng quản lý công việc khoa học, quản lý con người</p><p>- Kỹ năng quản lý/thúc đẩy bán hàng với quy mô 10 - 20 nhân sự</p><p>- Kỹ năng thuyết phục và xử lý tình huống hiệu quả trong quản lý lực lượng bán và tư vấn KH</p><p>- Kỹ năng phân tích tâm lý KH ưu tiên, kỹ năng tiếp cận và khai thác khách hàng</p><p>- Kỹ năng giao tiếp cuốn hút, trình bày tốt, tự tin, có khả năng trình bày, thuyết trình rõ ràng, hiệu quả.</p>','<p>- Chịu trách nhiệm hoàn thành các chỉ tiêu kinh doanh được giao trên trên phạm vi lực lượng RM quản lý. Chỉ tiêu KD bao gồm: các sản phẩm cơ bản, sản phẩm đầu tư, bảo hiểm... cung cấp cho phân khúc KHUT. Thực hiện các kế hoạch kinh doanh, CT thúc đẩy bán.</p><p>- Xây dựng và tổ chức triển khai các hoạt động KD trên phân khúc AF, tập trung vào các SP Đầu tư, BH, các hoạt động tổ chức các hội thảo, Seminar,GP, Training, Workshop....</p><p>- Chịu trách nhiệm chính về kết quả bán hàng, các chỉ tiêu KD, KPI của lực lượng RM được phân công quản lý, hỗ trợ. Quản lý việc thúc đẩy bán hàng đối với lực lượng RM: hướng dẫn, giám sát việc xây dựng kế hoạch kinh doanh, cam kết kinh doanh của lực lượng RM , thúc đẩy RM hoàn thành các chỉ tiêu cá nhân.</p><p>- Tham gia vào quá trình tuyển dụng/điều chuyển, quản lý việc đánh giá năng lực; phân cấp và xem xét lộ trình thăng tiến của lực lượng RM trong phạm vi quản lý.</p><p>- Đào tạo lực lượng RM đảm bảo chất lượng cán bộ bán hàng ở phân khúc KHUT</p><p>- Đề xuất/đề cử hoặc chỉ định các vị trí RM tham gia các hoạt động ngắn hạn, event, chương trình của phân khúc KHUT.</p><p>- Phát triển đội ngũ tư vấn, chăm sóc khách hàng tại các đơn vị: kiểm soát chất lượng nghiệp vụ, kiến thức chuyên môn, kiến thức sản phẩm.</p><p>- Chăm sóc và xây dựng mạng lưới quan hệ khách hàng cao cấp nhằm phát triền và mở rộng danh mục KHUT, Tối đa hóa việc khai thác/bán chéo danh mục KHUT.</p><p>- Tuân thủ nghiêm túc Nội quy lao động/ Quản trị rủi ro của Ngân hàng</p><p>- Thực hiện công việc theo đúng chính sách, quy định, quy trình, hướng dẫn nội bộ...và cam kết chất lượng dịch vụ (SLAs)</p>','<h2><strong>Thu nhập</strong></h2><ul class=\"tiptap-bullet-list\"><li class=\"tiptap-list-item\"><p>Thu nhập khi đạt 100% KPI: Thoả thuận</p></li><li class=\"tiptap-list-item\"><p>Thu nhập tính theo tỷ lệ đạt KPI</p></li><li class=\"tiptap-list-item\"><p>Lương cứng không phụ thuộc doanh số</p></li></ul><h2><strong>Quyền lợi được hưởng</strong></h2><p>- Thu nhập hấp dẫn, lương thưởng cạnh tranh theo năng lực<br>- Thưởng các Ngày lễ, Tết (theo chính sách ngân hàng từng thời kỳ)<br>- Được vay ưu đãi theo chính sách ngân hàng từng thời kỳ<br>- Chế độ ngày phép hấp dẫn theo cấp bậc công việc<br>- Bảo hiểm bắt buộc theo luật lao động + Bảo hiểm VPBank care cho CBNV tùy theo cấp bậc và thời gian công tác<br>- Được tham gia các khóa đào tạo tùy thuộc vào Khung đào tạo cho từng vị trí<br>- Thời gian làm việc: từ thứ 2 – thứ 6 &amp; 2 sáng thứ 7/ tháng<br>- Môi trường làm việc năng động, thân thiện, có nhiều cơ hội học đào tạo, học hỏi và phát triển; được tham gia nhiều hoạt động văn hóa thú vị (cuộc thi về thể thao, tài năng, hoạt động teambuiding...)</p><h2><strong>Thời gian làm việc</strong></h2><p>Thứ 2 - Thứ 6 (từ 08:00 đến 17:30)</p><p>Thứ 7 (từ 08:00 đến 12:00)</p>',NULL,NULL,'Nam','Nhân viên chính thức','Đại học','2 - 5 năm','2025-12-02 10:14:43',NULL);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUser` int DEFAULT NULL,
  `idCompany` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idUser` (`idUser`),
  KEY `idCompany` (`idCompany`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`id`),
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`idCompany`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Table structure for table `save_job`
--

DROP TABLE IF EXISTS `save_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `save_job` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUser` int DEFAULT NULL,
  `idJob` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idUser` (`idUser`),
  KEY `idJob` (`idJob`),
  CONSTRAINT `save_job_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`id`),
  CONSTRAINT `save_job_ibfk_2` FOREIGN KEY (`idJob`) REFERENCES `jobs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `save_job`
--

LOCK TABLES `save_job` WRITE;
/*!40000 ALTER TABLE `save_job` DISABLE KEYS */;
INSERT INTO `save_job` VALUES (13,2,2,'2025-12-05 15:02:44'),(17,2,4,'2025-12-06 17:04:15'),(18,2,6,'2025-12-06 19:15:19');
/*!40000 ALTER TABLE `save_job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idProvince` int DEFAULT NULL,
  `phone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatarPic` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthDay` datetime DEFAULT NULL,
  `intro` varchar(10000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkSocial` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sex` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token for password reset functionality',
  `resetTokenExpiry` datetime DEFAULT NULL COMMENT 'Expiry time for reset token (15 minutes from creation)',
  PRIMARY KEY (`id`),
  KEY `idProvince` (`idProvince`),
  KEY `idx_users_reset_token` (`resetToken`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`idProvince`) REFERENCES `provinces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Nguyễn Văn A','nguyenvana@gmail.com','$2b$10$YIoZBGhmgj9FfIM3LOkkGu/gejsOeOc5y7eGZyCChFSyh.QTuj82S',20,'0123456789','avatars/avatar-1-54c91ed0-ec23-4674-9f8e-647cf9d2124f.jpg','1990-01-01 07:00:00','Tôi là một lập trình viên có 3 năm kinh nghiệm...','https://facebook.com/nguyenvana','Nam',NULL,NULL),(2,'Trầm Khôi Nguyên','tramkhoinguyen27122@gmail.com','$2b$10$9MIy0NQUbZl4c.G1px3g1u1vaon.Hn31wnlM7k1SpFBA.JysGd5O.',20,'0987769860','avatars/avatar-2-c32a5cda-4b55-4461-a337-6ea7e6ccf3a1.jpg','2004-01-27 07:00:00','<p>ádasd2222</p>','https://www.facebook.com/khoinguyen2701','Nam',NULL,NULL);
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

-- Dump completed on 2025-12-08 15:44:39
