function Health() {
}

export async function getServerSideProps(context) {
  context.res.end('healthy');
  return { props: { } }
}

export default Health;