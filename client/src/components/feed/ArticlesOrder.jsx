import React, { useState, useEffect } from "react";

import { Box, HStack, VStack, Text } from "@chakra-ui/react";

import { Link as RRLink, useNavigate } from "react-router-dom";
import ArticleBox from "./ArticleBox";
import ArticleRow from "./ArticleRow";

const ArticlesOrder = ({ data }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${window.apiIP}/verify-token/${token}`);

        if (response.ok) {
          console.log("OK");
        }
      } catch (error) {
        navigate("/home", { replace: true });
      }
    };

    verifyToken();
  }, []);

  const updateViewHistory = async (event, articleID, articleCategory) => {
    try {
      console.log("updating " + articleID);

      fetch(`${window.apiIP}/update_views`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aid: articleID, category: articleCategory }),
      })
        .then((res) => {
          console.log("Updated user read history", res);
        })
        .catch((err) => {
          throw new Error(err);
        });

      // const responseData = await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <>
      {typeof data !== "string" ? (
        <>
          {/* mobile: one column of rows (switched with CSS so it follows window resizes) */}
          <VStack
            display={{ base: "flex", lg: "none" }}
            w="100%"
            spacing="22px"
            align="stretch"
          >
            {data.flat().map((articleObj, index) => (
              <Box
                as={RRLink}
                key={articleObj._id}
                display="block"
                to={`/article/${articleObj.title.replaceAll("/", "-")}`}
                state={{ data: articleObj }}
                onClick={(e) =>
                  updateViewHistory(e, articleObj._id, articleObj.category)
                }
              >
                <ArticleRow articleData={articleObj} articleIndex={index} />
              </Box>
            ))}
          </VStack>

          {/* desktop: each chunk of the feed is a column */}
          <HStack display={{ base: "none", lg: "flex" }} w="100%" align={"start"}>
            {data.map((articlesArray, outerIndex) => (
              // columns share the width equally and shrink with the window
              <VStack p="1" key={outerIndex} flex="1" minW="0" align="stretch">
                {articlesArray.map((articleObj, inIndex) => (
                  <Box
                    as={RRLink}
                    key={articleObj._id}
                    display="block"
                    to={`/article/${articleObj.title.replaceAll("/", "-")}`}
                    state={{ data: articleObj }}
                    onClick={(e) =>
                      updateViewHistory(e, articleObj._id, articleObj.category)
                    }
                  >
                    <ArticleBox
                      articleData={articleObj}
                      articleIndex={`${outerIndex}_${inIndex}`}
                    />
                  </Box>
                ))}
              </VStack>
            ))}
          </HStack>
        </>
      ) : (
        <Text w="100%" fontSize="xl">{data}</Text>
      )}
    </>
  );
};

export default ArticlesOrder;
