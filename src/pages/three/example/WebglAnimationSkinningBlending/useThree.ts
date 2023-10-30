import * as THREE from 'three'

import {useThreeBase} from "@/hooks/useThreeBase";

export const useThree = () => {
  const { stats, renderer, camera, clock, controls, scene, loader } = useThreeBase()

}
