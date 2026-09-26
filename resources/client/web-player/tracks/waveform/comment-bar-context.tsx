import {createContext, RefObject, useMemo, useRef, useState} from 'react';

interface CommentBarContextValue {
  newCommentInputRef: RefObject<HTMLTextAreaElement | null>;
  newCommentPositionRef: RefObject<number>;
  markerIsVisible: boolean;
  setMarkerIsVisible: (value: boolean) => void;
  disableCommenting: boolean;
}

export const CommentBarContext = createContext<CommentBarContextValue>(null!);

interface CommentBarContextProps {
  children: any;
  disableCommenting?: boolean;
}
export function CommentBarContextProvider({
  children,
  disableCommenting = false,
}: CommentBarContextProps) {
  const [markerIsVisible, setMarkerIsVisible] = useState(false);
  const newCommentInputRef = useRef<HTMLTextAreaElement>(null);
  const newCommentPositionRef = useRef<number>(0);
  const value: CommentBarContextValue = useMemo(() => {
    return {
      newCommentInputRef,
      newCommentPositionRef,
      markerIsVisible,
      setMarkerIsVisible,
      disableCommenting,
    };
  }, [markerIsVisible, disableCommenting]);
  return (
    <CommentBarContext.Provider value={value}>
      {children}
    </CommentBarContext.Provider>
  );
}
