import React, { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  useDisclosure,
} from "@chakra-ui/react";
import footballIcon from "../../assets/icons/football.svg";
import dropdownIcon from "../../assets/icons/dropdown.svg";

// article categories stored by the crawler
export const CATEGORIES = [
  "business",
  "entertainment",
  "health",
  "politics",
  "sports",
];

// the Figma design only provides an icon for sports
const CATEGORY_ICONS = {
  sports: footballIcon,
};

const pillFont = "'Source Serif Pro', serif";

// colours of the selected "filter" pill in the Figma design
const selectedStyle = {
  bg: "rgba(40, 229, 116, 0.39)",
  borderColor: "#248B47",
  color: "#248B47",
  boxShadow: "inset 0px 0px 17px 0px white",
};

// "filter" pill from the Figma design: red "-:-" when showing all categories,
// green with icon + caret when some are selected. Opens a panel of toggleable tags;
// the selection is only sent (one request) when "Apply" is pressed.
const CategoryFilter = ({ value, onChange, ...rest }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // tags edit a draft; the applied selection stays in `value`
  const [draft, setDraft] = useState(value);

  const isAll = value.length === 0;
  const icon = value.length === 1 ? CATEGORY_ICONS[value[0]] : undefined;
  const label =
    value.length > 1 ? `${value[0]} +${value.length - 1}` : value[0];

  const draftChanged = draft.join(",") !== value.join(",");

  const open = () => {
    setDraft(value);
    onOpen();
  };

  const toggle = (cat) =>
    setDraft(
      draft.includes(cat)
        ? draft.filter((c) => c !== cat)
        : // keep the same order as CATEGORIES
          CATEGORIES.filter((c) => c === cat || draft.includes(c))
    );

  const apply = () => {
    if (draftChanged) onChange(draft);
    onClose();
  };

  return (
    <Box {...rest}>
      <Popover
        placement="bottom-start"
        isOpen={isOpen}
        onOpen={open}
        onClose={onClose}
      >
        <PopoverTrigger>
          <Button
            aria-label="Filter by category"
            // same box as the feed tabs next to it
            h="30px"
            minW={isAll ? "72px" : { base: "auto", md: "140px" }}
            px="12px"
            borderRadius="38px"
            border="2px solid"
            borderColor="#FF3131"
            bg="#FF3131"
            color="white"
            fontFamily={pillFont}
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="400"
            lineHeight="normal"
            _hover={{ opacity: 0.85 }}
            _active={{}}
            {...(isAll ? {} : selectedStyle)}
          >
            {isAll ? (
              "-:-"
            ) : (
              <Flex align="center" gap="1" w="100%">
                {icon ? <img src={icon} alt="" width="20" height="20" /> : null}
                <Text flex="1" textAlign="center" textTransform="capitalize">
                  {label}
                </Text>
                <img src={dropdownIcon} alt="" width="20" height="20" />
              </Flex>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          w="auto"
          maxW="calc(100vw - 32px)"
          bg="#FAF9DD"
          border="1px solid #248B47"
          borderRadius="12px"
          _focusVisible={{ outline: "none" }}
        >
          <PopoverBody p="3">
            <Wrap spacing="2" maxW="300px">
              {CATEGORIES.map((cat) => {
                const selected = draft.includes(cat);
                return (
                  <WrapItem key={cat}>
                    <Tag
                      as="button"
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggle(cat)}
                      size="lg"
                      h="30px"
                      borderRadius="38px"
                      border="2px solid"
                      borderColor={selected ? "#248B47" : "#303030"}
                      borderStyle={selected ? "solid" : "dashed"}
                      bg={selected ? selectedStyle.bg : "transparent"}
                      boxShadow={selected ? selectedStyle.boxShadow : "none"}
                      color={selected ? "#248B47" : "#303030"}
                      fontFamily={pillFont}
                      cursor="pointer"
                      _hover={{ bg: selected ? selectedStyle.bg : "#E8E7C8" }}
                    >
                      {CATEGORY_ICONS[cat] ? (
                        <img
                          src={CATEGORY_ICONS[cat]}
                          alt=""
                          width="18"
                          height="18"
                          style={{ marginRight: 4 }}
                        />
                      ) : null}
                      <TagLabel textTransform="capitalize">{cat}</TagLabel>
                    </Tag>
                  </WrapItem>
                );
              })}
            </Wrap>
            <HStack mt="3" justify="space-between">
              <Button
                variant="link"
                size="sm"
                color="#FF3131"
                fontWeight="400"
                isDisabled={draft.length === 0}
                onClick={() => setDraft([])}
              >
                Clear
              </Button>
              <Button
                size="sm"
                h="30px"
                px="4"
                borderRadius="10px"
                bg="#303030"
                color="white"
                fontWeight="400"
                _hover={{ bg: "#4B4B4B" }}
                isDisabled={!draftChanged}
                onClick={apply}
              >
                Apply
              </Button>
            </HStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default CategoryFilter;
