create database archery character set utf8;
use archery;
grant all on archery.* to archery_user@localhost;
set password for archery_user@localhost=password('archery_password');