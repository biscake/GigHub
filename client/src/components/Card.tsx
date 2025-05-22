export const Card = () => {
  return (
    <div className="border border-gray-400 rounded-lg p-4 mb-2">
      {/* Custom image component */}
      <img src="/GigHub.png"></img>
      <h2 className="font-bold">Card Title</h2>
      {/* Custom Link component to wrap whole card */}
      <p>Card Description, anything goes here whatever you wish for.</p>
      <p>Job Poster</p>
    </div>
  )
}