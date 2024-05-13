import React, { useState, useEffect } from "react";
import {
  Box,
  Divider,
  VStack,
  HStack,
  Badge,
  Tag,
  AvatarGroup,
  Avatar,
} from "@chakra-ui/react";

const FilterBar = () => {
  return (
    <HStack mt="15px" mb="15px">
      <Badge
        bg="#303030"
        w="140px"
        p="2"
        borderRadius="full"
        textAlign="center"
        fontSize="lg"
        fontWeight="400"
        color="#FFFFFF"
      >
        Latest
      </Badge>
      <Badge
        bg="#303030"
        w="140px"
        p="2"
        borderRadius="full"
        textAlign="center"
        fontSize="lg"
        fontWeight="400"
        color="#FFFFFF"
      >
        Trends
      </Badge>
      <Badge
        bg="#303030"
        w="140px"
        p="2"
        borderRadius="full"
        textAlign="center"
        fontSize="lg"
        fontWeight="400"
        color="#FFFFFF"
      >
        Personalized
      </Badge>
    </HStack>
  );
};

export default FilterBar;
