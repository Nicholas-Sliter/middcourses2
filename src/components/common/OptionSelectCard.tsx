import { useState, useEffect } from "react";

interface OptionSelectCardProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onSelect: (options: string[]) => void;
  validator?: (options: string[]) => string;
  allowCustom?: boolean;
  useDropdown?: boolean;
  allowEmpty?: boolean;
  limit?: number;
}

export default function OptionSelectCard({
  title,
  options,
  selectedOptions = [],
  onSelect,
  allowCustom = false,
  useDropdown = true,
  initialDropdownOptions,
  validator,
  limit = 1,
  allowEmpty = false,
}) {



   





}
