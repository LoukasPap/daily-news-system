import React, { useState, useEffect } from "react";
import {
  Box,
  Divider,
  Heading,
  Text,
  AvatarGroup,
  Avatar,
  Link,
  border,
  Flex,
} from "@chakra-ui/react";

const ArticleBox = ({ articleData, articleIndex }) => {
  const sizes = ["lg", "xl", "2xl", "3xl", "4xl"];
  console.log(articleData);

  return (
    <Box
      id={`article${articleIndex}`}
      bg="linear-gradient(90deg, #1F1F1F 0%, #353535 80%);"
      borderRadius="9px"
      p="15px"
    >
      <Heading>
        <Text
          fontFamily="KyivType Titling"
          fontSize={sizes[Math.floor(Math.random() * sizes.length)]}
          fontWeight="300"
          color="#FFFFFF"
        >
          {articleData.title}
        </Text>
      </Heading>
      <Divider
        orientation="horizontal"
        w="45%"
        border="1px solid #FAFF00"
        mt="10px"
        mb="10px"
      />

      <Text fontWeight="200" color="#A7A7A7">
        {articleData.datetime}
      </Text>
      <Text fontWeight="200" color="#A7A7A7">
        {articleData.new_site}
      </Text>
      <Text fontWeight="200" color="#A7A7A7">
        {articleData.category.toUpperCase()}
      </Text>

      <Flex justify="space-between" alignItems="baseline">
        <AvatarGroup size="sm" mt="5" max={2}>
          {articleData.authors.map((author, index2) => (
            <Avatar
              name={author}
              bg="red.500"
              color="white"
              border={"1px solid #F5FFE4"}
            />
          ))}
        </AvatarGroup>

        <Text fontWeight="200" color="#A7A7A7">
          {Math.ceil(articleData.estimated_reading_time / 60) == 0
            ? 1 + " min"
            : Math.ceil(articleData.estimated_reading_time / 60) + " mins"}
        </Text>
      </Flex>
    </Box>
  );
};

export default ArticleBox;
