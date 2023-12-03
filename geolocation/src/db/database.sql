--CREATE DATABASE geolocation;

CREATE TABLE users
(
  id serial primary key,
  first_name varchar (64),
  last_name varchar (64),
  email varchar (64),
  password varchar (64)
);