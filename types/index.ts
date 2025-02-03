export interface ArtistProfileData {
    mediums: string[];
    styles: string[];
    subjects: string[];
  }
  
  export type Step = 0 | 1 | 2;
  
  export interface OptionButtonProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
  }