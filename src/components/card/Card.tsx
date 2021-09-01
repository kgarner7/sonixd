import React, { useState } from 'react';
import path from 'path';
import settings from 'electron-settings';
import { Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import cacheImage from '../shared/cacheImage';
import { getAlbum, getPlaylist } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import { fixPlayer2Index, setPlayQueue } from '../../redux/playQueueSlice';
import { isCached, getImageCachePath } from '../../shared/utils';

import {
  StyledPanel,
  InfoPanel,
  InfoSpan,
  CardTitleButton,
  CardSubtitleButton,
  CardSubtitle,
  CardImg,
  LazyCardImg,
  Overlay,
  HoverControlButton,
} from './styled';
import { setStatus } from '../../redux/playerSlice';

const Card = ({
  onClick,
  url,
  subUrl,
  hasHoverButtons,
  lazyLoad,
  playClick,
  size,
  ...rest
}: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [cacheImages] = useState(Boolean(settings.getSync('cacheImages')));
  const [cachePath] = useState(path.join(getImageCachePath(), '/'));

  const handleClick = () => {
    history.push(url);
  };

  const handleSubClick = () => {
    history.push(subUrl);
  };

  const handlePlayClick = async () => {
    if (playClick.type === 'playlist') {
      const res = await getPlaylist(playClick.id);
      dispatch(setPlayQueue({ entries: res.entry }));
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }

    if (playClick.type === 'album') {
      const res = await getAlbum(playClick.id);
      dispatch(setPlayQueue({ entries: res.song }));
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }

    if (playClick.type === 'artist') {
      const res = await getAlbum(playClick.id);
      dispatch(setPlayQueue({ entries: res.song }));
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }
  };

  return (
    <StyledPanel bordered shaded cardsize={size} style={rest.style}>
      <Overlay cardsize={size}>
        {lazyLoad ? (
          <LazyCardImg
            src={
              isCached(
                `${cachePath}${rest.details.cacheType}_${rest.details.id}.jpg`
              )
                ? `${cachePath}${rest.details.cacheType}_${rest.details.id}.jpg`
                : rest.coverArt
            }
            alt="img"
            effect="opacity"
            onClick={handleClick}
            cardsize={size}
            visibleByDefault={cacheImages}
            afterLoad={() => {
              if (cacheImages) {
                cacheImage(
                  `${rest.details.cacheType}_${rest.details.id}.jpg`,
                  rest.coverArt.replace(/size=\d+/, 'size=350')
                );
              }
            }}
          />
        ) : (
          <CardImg
            src={rest.coverArt}
            alt="img"
            onClick={handleClick}
            cardsize={size}
          />
        )}

        {hasHoverButtons && (
          <HoverControlButton
            size="lg"
            circle
            icon={<Icon icon="play" />}
            onClick={handlePlayClick}
          />
        )}
      </Overlay>
      <InfoPanel cardsize={size}>
        <InfoSpan>
          <CardTitleButton
            appearance="link"
            size="sm"
            onClick={handleClick}
            cardsize={size}
          >
            {rest.title}
          </CardTitleButton>
        </InfoSpan>
        <InfoSpan>
          {subUrl ? (
            <CardSubtitleButton
              appearance="link"
              size="xs"
              onClick={handleSubClick}
              cardsize={size}
            >
              {rest.subtitle}
            </CardSubtitleButton>
          ) : (
            <CardSubtitle cardsize={size}>{rest.subtitle}</CardSubtitle>
          )}
        </InfoSpan>
      </InfoPanel>
    </StyledPanel>
  );
};

export default Card;
