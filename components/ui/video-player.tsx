interface VideoPlayerProps {
  videoUrl: string
  courseId: string
  chapterId: string
  lessonId: string
  isCompleted?: boolean
  title: string
  subtitleUrl?: string
}

export const VideoPlayer = ({
  videoUrl,
  isCompleted,
  title,
  subtitleUrl,
}: VideoPlayerProps) => {
  return (
    <video
      controls
      className="w-full aspect-video"
      poster={isCompleted ? '/images/completed-video.png' : undefined}
    >
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
      {subtitleUrl && (
        <track
          kind="captions"
          src={subtitleUrl}
          srcLang="en"
          label={title}
        />
      )}
    </video>
  )
}