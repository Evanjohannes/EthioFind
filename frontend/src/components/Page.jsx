export default function Page({ wide = false, children }) {
  return (
    <div
      className={`mx-auto w-full px-4 pt-4 pb-32 md:px-6 md:pt-6 ${
        wide ? 'max-w-md md:max-w-3xl lg:max-w-6xl' : 'max-w-md md:max-w-2xl'
      }`}
    >
      {children}
    </div>
  )
}