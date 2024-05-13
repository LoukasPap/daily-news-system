import React, { useState, useEffect } from "react";
import {
  Box,
  Divider,
  VStack,
  HStack,
  Heading,
  Text,
  AvatarGroup,
  Avatar,
} from "@chakra-ui/react";

const ArticlesOrder = ({ data }) => {
    const sizes = ["lg", "xl", "2xl", "3xl", "4xl"]
    return (
        <HStack align={"start"}>
        {data.map((articlesArray, index) => (
            <VStack p="1">
            {articlesArray.map((articleObj, artIndex) => (
                <Box
                bg="linear-gradient(90deg, #1F1F1F 0%, #353535 100%);"
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
                    {articleObj.title}
                    </Text>
                </Heading>
                <Divider
                    orientation="horizontal"
                    w="40%"
                    border="1px solid #FAFF00"
                    mt="10px"
                    mb="10px"
                />

                <Text fontWeight="200" color="#A7A7A7">{articleObj.datetime}</Text>
                <Text fontWeight="200" color="#A7A7A7">{articleObj.new_site}</Text>
                <Text fontWeight="200" color="#A7A7A7">{articleObj.category.toUpperCase()}</Text>

                {/* <Badge>{articleObj.authors.join(", ")}</Badge> */}

                <AvatarGroup size="sm" mt="5" max={2}>
                    {articleObj.authors.map((author, index2) => (
                    <Avatar
                        name={author}
                        bg="red.500"
                        color="white"
                        border={"1px solid #F5FFE4"}
                    />
                    ))}
                </AvatarGroup>
                </Box>
            ))}
            </VStack>
        ))}
        </HStack>
    );
};

export default ArticlesOrder;
