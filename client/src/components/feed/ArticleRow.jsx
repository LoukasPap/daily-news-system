import React from "react";
import { Box, Flex, Text, AvatarGroup, Avatar } from "@chakra-ui/react";

const ArticleRow = ({ articleData, articleIndex }) => {
  return (
    <Flex
      id={`article${articleIndex}`}
      bgGradient="linear(90deg, #1F1F1F 0%, #353535 100%)"
      borderRadius="10px"
      px="15px"
      py="20px"
      gap="10px"
      align="center"
      overflow="hidden"
      w="100%"
      // trim text boxes to cap height / baseline, as in the Figma design
      sx={{ "& p": { textBoxTrim: "trim-both", textBoxEdge: "cap alphabetic" } }}
    >
      {/* left: title + date */}
      <Flex
        direction="column"
        justify="center"
        gap="12px"
        flex={{ base: "0 1 170px", md: "1 1 auto" }}
        minW="0"
      >
        <Text
          fontFamily="KyivType Titling"
          fontSize={{ base: "13px", md: "lg" }}
          fontWeight="350"
          lineHeight="normal"
          color="#FFFFFF"
          noOfLines={4}
          wordBreak="break-word"
          // trim only the top: trimming the bottom would clip descenders of the clamped last line
          sx={{ "&&": { textBoxTrim: "trim-start" } }}
        >
          {articleData.title}
        </Text>
        <Text fontSize="12px" fontWeight="200" lineHeight="normal" color="#A7A7A7">
          {articleData.datetime}
        </Text>
      </Flex>

      {/* right: category, site, authors */}
      <Flex
        direction="column"
        align="end"
        justify="space-between"
        alignSelf="stretch"
        gap="8px"
        // never narrower than its content; on small phones the title column shrinks instead
        flex={{ base: "1 0 auto", md: "0 0 auto" }}
        textAlign="end"
      >
        <Text
          fontSize="14px"
          fontWeight="200"
          lineHeight="normal"
          color="#E0E404"
          textTransform="capitalize"
        >
          {articleData.category}
        </Text>
        <Text fontSize="13px" fontWeight="200" lineHeight="normal" color="#A7A7A7">
          {articleData.new_site}
        </Text>
        <Box>
          <AvatarGroup
            size="xs"
            max={2}
            spacing="-6px"
            sx={{
              ".chakra-avatar__excess": {
                boxSize: "29px",
                bg: "#4B4B4B",
                color: "white",
                fontSize: "7px",
                border: "1px solid #F5FFE4",
              },
            }}
          >
            {articleData.authors.map((author, index) => (
              <Avatar
                key={`${author}-${index}`}
                name={author}
                boxSize="29px"
                bg="red.500"
                color="white"
                border="1px solid #F5FFE4"
              />
            ))}
          </AvatarGroup>
        </Box>
      </Flex>
    </Flex>
  );
};

export default ArticleRow;
