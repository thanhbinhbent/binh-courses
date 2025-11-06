interface VideoPlayerProps {
  videoUrl: string
  courseId: string
  chapterId: string
  lessonId: string
  isCompleted?: boolean
  title: string
}

export const VideoPlayer = ({
  videoUrl,
  isCompleted,
  title,
}: VideoPlayerProps) => {
  return (
    <video
      controls
      className="w-full aspect-video"
      poster={isCompleted ? '/images/completed-video.png' : undefined}
    >
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
      <track
        kind="captions"
        src=""
        srcLang="en"
        label={title}
      />
    </video>
  )
}