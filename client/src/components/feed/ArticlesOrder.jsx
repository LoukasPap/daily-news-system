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
  Link,
} from "@chakra-ui/react";

import { Link as RRLink, useNavigate } from "react-router-dom";
import ArticleBox from "./ArticleBox";

const ArticlesOrder = ({ data }) => {
  return (
    <HStack align={"start"}>
      {data.map((articlesArray, outeIndex) => (
        <VStack p="1">
          {articlesArray.map((articleObj, inIndex) => (
            <RRLink
              to={`/article/${articleObj.title.replace("/","-")}`}
              state={{ data: articleObj }}
            >
              <ArticleBox
                articleData={articleObj}
                articleIndex={`${outeIndex}_${inIndex}`}
              />
            </RRLink>
          ))}
        </VStack>
      ))}
    </HStack>
  );
};

export default ArticlesOrder;
