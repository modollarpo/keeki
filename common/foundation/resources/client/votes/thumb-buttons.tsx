import {useStoreVote} from '@common/votes/requests/use-store-vote';
import {VotableModel} from '@common/votes/votable-model';
import {Button} from '@shadcn/button/button';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import clsx from 'clsx';
import {ThumbsDownIcon, ThumbsUpIcon} from 'lucide-react';
import {useState} from 'react';

interface Props {
  model: VotableModel;
  className?: string;
  showUpvotesOnly?: boolean;
}
export function ThumbButtons({model, className, showUpvotesOnly}: Props) {
  const changeVote = useStoreVote(model);

  const [upvotes, setUpvotes] = useState(model.upvotes || 0);
  const [downvotes, setDownvotes] = useState(model.downvotes || 0);
  const [currentVote, setCurrentVote] = useState(model.current_vote);

  const syncLocalState = (model: VotableModel) => {
    setUpvotes(model.upvotes);
    setDownvotes(model.downvotes);
    setCurrentVote(model.current_vote);
  };

  return (
    <div className={clsx(className, 'whitespace-nowrap')}>
      <Button
        variant="ghost"
        size="sm"
        color={currentVote === 'upvote' ? 'primary' : 'default'}
        disabled={changeVote.isPending}
        aria-label="Upvote"
        onClick={() => {
          changeVote.mutate(
            {voteType: 'upvote'},
            {
              onSuccess: response => syncLocalState(response.model),
            },
          );
        }}
      >
        <ThumbsUpIcon />
        <FormattedNumber value={upvotes} />
      </Button>
      {!showUpvotesOnly && (
        <Button
          variant="ghost"
          size="sm"
          color={currentVote === 'downvote' ? 'primary' : 'default'}
          disabled={changeVote.isPending}
          aria-label="Downvote"
          onClick={() => {
            changeVote.mutate(
              {voteType: 'downvote'},
              {
                onSuccess: response => syncLocalState(response.model),
              },
            );
          }}
        >
          <ThumbsDownIcon />
          <FormattedNumber value={downvotes} />
        </Button>
      )}
    </div>
  );
}
